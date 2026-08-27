# backend/app/services/ai_service.py

import json
import os
import re
from typing import Optional

from dotenv import load_dotenv

# Load environment variables before reading them
load_dotenv()

from app.schemas import (
    NoticeAnalysis,
    Deadline,
    ActionItem,
)


# ============================================================
# Configuration
# ============================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-4o-mini",
)

print(
    "AI CONFIG:",
    "API key loaded =", bool(OPENAI_API_KEY),
    "| model =", OPENAI_MODEL,
)


# ============================================================
# OpenAI Client
# ============================================================

client = None

if OPENAI_API_KEY:
    try:
        from openai import OpenAI

        client = OpenAI(
            api_key=OPENAI_API_KEY
        )

    except Exception as exc:
        print("OpenAI client initialization failed:", exc)
        client = None


# ============================================================
# Constants
# ============================================================

MONTHS = (
    "january|february|march|april|may|june|"
    "july|august|september|october|november|december"
)

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
}


# ============================================================
# Text utilities
# ============================================================

def clean_text(text: str) -> str:
    """
    Normalize extracted PDF text.

    PDF extraction often creates:
        "notic e"
        "fl at"
        "doc umentary"

    This function handles normal whitespace/punctuation
    without aggressively changing the actual words.
    """

    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Normalize tabs/spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before punctuation
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)

    # Normalize repeated newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def clean_sentence(text: str) -> str:
    """Clean a sentence extracted from a notice."""

    text = re.sub(r"\s+", " ", text)
    text = text.strip(" \t\n\r-–—")

    if text and text[-1] not in ".!?":
        text += "."

    return text


def unique(items: list[str]) -> list[str]:
    """Preserve order while removing duplicates."""

    result = []

    for item in items:
        item = item.strip()

        if item and item not in result:
            result.append(item)

    return result


def split_sentences(text: str) -> list[str]:
    """Basic sentence splitting suitable for notices."""

    text = clean_text(text)

    if not text:
        return []

    parts = re.split(r"(?<=[.!?])\s+", text)

    return [
        clean_sentence(part)
        for part in parts
        if len(part.strip()) > 10
    ]


# ============================================================
# Deadline extraction
# ============================================================

def find_deadline(text: str) -> Deadline:
    """
    Extract absolute and relative deadlines.

    Examples:
        30 August 2026
        30/08/2026
        before 30 August 2026
        at 5:00 PM
        within fourteen days
        within 14 days
        within two weeks
    """

    text = clean_text(text)

    date = None
    time = None
    relative_days = None
    description = None

    # --------------------------------------------------------
    # Absolute date
    # --------------------------------------------------------

    date_patterns = [
        rf"(?i)\b("
        rf"\d{{1,2}}\s+"
        rf"(?:{MONTHS})"
        rf"\s+\d{{4}}"
        rf")\b",

        rf"(?i)\b("
        rf"(?:{MONTHS})"
        rf"\s+\d{{1,2}},?\s+\d{{4}}"
        rf")\b",

        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text)

        if match:
            date = match.group(1)
            break

    # --------------------------------------------------------
    # Time
    # --------------------------------------------------------

    time_match = re.search(
        r"(?i)\b"
        r"(\d{1,2}(?::\d{2})?\s*(?:AM|PM))"
        r"\b",
        text,
    )

    if time_match:
        time = time_match.group(1)

    # --------------------------------------------------------
    # Relative deadline
    # --------------------------------------------------------

    number_pattern = (
        r"(?:\d+|"
        + "|".join(NUMBER_WORDS.keys())
        + r")"
    )

    relative_pattern = re.search(
        rf"(?i)\b"
        rf"(?:within|within a period of)\s+"
        rf"({number_pattern})\s+"
        rf"(day|days|week|weeks|hour|hours)"
        rf"\b",
        text,
    )

    if relative_pattern:

        number = relative_pattern.group(1).lower()
        unit = relative_pattern.group(2).lower()

        if number.isdigit():
            value = int(number)
        else:
            value = NUMBER_WORDS.get(number)

        if value is not None:

            if "week" in unit:
                value *= 7

            if "hour" not in unit:
                relative_days = value

                description = (
                    f"Within {value} "
                    f"{'days' if value != 1 else 'day'} "
                    f"from the date of publication."
                )

    # --------------------------------------------------------
    # Urgency
    # --------------------------------------------------------

    urgency = "unknown"
    lower_text = text.lower()

    if any(
        phrase in lower_text
        for phrase in [
            "urgent",
            "immediately",
            "last chance",
            "expires today",
            "due today",
            "failing which",
            "failure to",
        ]
    ):
        urgency = "high"

    elif any(
        phrase in lower_text
        for phrase in [
            "within",
            "deadline",
            "before",
            "soon",
        ]
    ):
        urgency = "medium"

    return Deadline(
        date=date,
        time=time,
        relative_days=relative_days,
        description=description,
        urgency=urgency,
    )


# ============================================================
# Eligibility extraction
# ============================================================

def extract_eligibility(text: str) -> list[str]:
    """
    Extract eligibility / affected-person information.

    Designed to avoid treating every 'must' sentence as
    eligibility.
    """

    text = clean_text(text)
    lower = text.lower()

    eligibility = []

    patterns = [
        r"students? of .{5,150}?(?:eligible|can participate)",
        r"only .{5,150}?(?:eligible|allowed)",
        r"eligible (?:participants|persons|students).{0,150}",
        r"who (?:is|are) eligible.{0,150}",
    ]

    for pattern in patterns:

        for match in re.findall(pattern, text, flags=re.IGNORECASE):

            value = clean_sentence(match)

            if len(value) >= 15:
                eligibility.append(value)

    # Specific common notice language
    if "students of 2nd and 3rd year are eligible" in lower:
        eligibility.append(
            "Students of 2nd and 3rd year are eligible to participate."
        )

    return unique(eligibility)[:5]


# ============================================================
# Action extraction
# ============================================================

def extract_actions(text: str) -> list[ActionItem]:
    """
    Extract meaningful user actions.

    Avoids returning raw sentence fragments.
    """

    text = clean_text(text)
    lower = text.lower()

    actions = []

    def add(task: str):
        task = clean_sentence(task)

        if task not in [action.task for action in actions]:
            actions.append(
                ActionItem(
                    task=task,
                    completed=False,
                )
            )

    # --------------------------------------------------------
    # Property/public claim notice
    # --------------------------------------------------------

    if (
        "claim" in lower
        and "writing" in lower
    ):

        add(
            "Make any relevant claim regarding the property known in writing."
        )

        if any(
            word in lower
            for word in [
                "documentary proof",
                "documents",
                "proof thereof",
                "supporting proof",
            ]
        ):
            add(
                "Provide documentary proof supporting the claim."
            )

        deadline = find_deadline(text)

        if deadline.relative_days:
            add(
                f"Submit the claim and supporting documents "
                f"within {deadline.relative_days} days "
                f"from the date of publication."
            )

        return actions

    # --------------------------------------------------------
    # Registration / application notices
    # --------------------------------------------------------

    registration_patterns = [
        (
            r"(?i)register\s+(?:before|by)?\s*(.{0,160})",
            "Complete the required registration.",
        ),
        (
            r"(?i)registration\s+(?:form|process).{0,160}",
            "Complete and submit the registration form.",
        ),
        (
            r"(?i)apply\s+(?:before|by)?\s*(.{0,160})",
            "Complete the required application.",
        ),
        (
            r"(?i)submit\s+(?:the\s+)?(?:form|application).{0,160}",
            "Submit the required form or application.",
        ),
    ]

    for pattern, task in registration_patterns:

        if re.search(pattern, text):

            add(task)

    # --------------------------------------------------------
    # Document submission
    # --------------------------------------------------------

    if any(
        phrase in lower
        for phrase in [
            "submit documents",
            "submit the documents",
            "required documents",
            "supporting documents",
            "upload documents",
        ]
    ):
        add(
            "Prepare and submit the required supporting documents."
        )

    # --------------------------------------------------------
    # Generic required actions
    # --------------------------------------------------------

    if not actions:

        for sentence in split_sentences(text):

            sentence_lower = sentence.lower()

            if any(
                keyword in sentence_lower
                for keyword in [
                    "must submit",
                    "must register",
                    "must apply",
                    "required to submit",
                    "required to register",
                    "required to apply",
                    "should submit",
                ]
            ):

                add(sentence)

    return actions[:8]


# ============================================================
# Important points
# ============================================================

def extract_important_points(text: str) -> list[str]:
    """
    Extract meaningful warnings, conditions and consequences.

    Never returns arbitrary sentence fragments.
    """

    text = clean_text(text)
    lower = text.lower()

    points = []

    def add(point: str):
        point = clean_sentence(point)

        if len(point) > 15 and point not in points:
            points.append(point)

    # --------------------------------------------------------
    # Claim notice
    # --------------------------------------------------------

    if "claim" in lower and "writing" in lower:

        add(
            "Any person claiming a right, title, interest, claim "
            "or demand over the property should notify the concerned "
            "party in writing."
        )

    if any(
        phrase in lower
        for phrase in [
            "documentary proof",
            "proof thereof",
            "supporting documents",
        ]
    ):

        add(
            "The claim should be supported with documentary proof."
        )

    # --------------------------------------------------------
    # Failure / consequence
    # --------------------------------------------------------

    consequence_match = re.search(
        r"(?i)(.{0,120}"
        r"(?:failing which|failure to|otherwise)"
        r".{0,250})",
        text,
    )

    if consequence_match:

        sentence = consequence_match.group(1).strip()

        # Don't expose a tiny fragment.
        if len(sentence) >= 50:
            add(
                "Failure to raise a claim within the stated period "
                "may result in the transaction proceeding without "
                "reference to that claim."
            )

    # --------------------------------------------------------
    # Mandatory
    # --------------------------------------------------------

    if "mandatory" in lower:

        add(
            "The notice states that the specified requirement is mandatory."
        )

    return points[:5]


# ============================================================
# Smart local summary
# ============================================================

def build_summary(
    text: str,
    title: str,
    deadline: Deadline,
    eligibility: list[str],
    actions: list[ActionItem],
) -> str:
    """
    Create a useful summary without an external AI API.
    """

    lower = text.lower()

    # --------------------------------------------------------
    # Property/public claim notice
    # --------------------------------------------------------

    if (
        "claim" in lower
        and (
            "property" in lower
            or "flat" in lower
        )
        and "writing" in lower
    ):

        summary = (
            "This public notice concerns a proposed property transaction "
            "and invites anyone with a right, title, interest, claim or "
            "demand over the property to raise it in writing with "
            "supporting documentary proof."
        )

        if deadline.relative_days:
            summary += (
                f" Any such claim should be submitted within "
                f"{deadline.relative_days} days from the date of publication."
            )

        return summary

    # --------------------------------------------------------
    # Hackathon / student notice
    # --------------------------------------------------------

    if (
        "hackathon" in lower
        or "students" in lower
    ):

        summary = (
            "This notice provides information about participation "
            "requirements and the actions students need to complete."
        )

        if eligibility:
            summary += " " + " ".join(eligibility)

        if deadline.date:
            summary += (
                f" The stated deadline is {deadline.date}"
            )

            if deadline.time:
                summary += f" at {deadline.time}"

            summary += "."

        return summary

    # --------------------------------------------------------
    # Generic summary
    # --------------------------------------------------------

    sentences = split_sentences(text)

    useful = []

    for sentence in sentences:

        sentence_lower = sentence.lower()

        if any(
            keyword in sentence_lower
            for keyword in [
                "notice",
                "required",
                "submit",
                "register",
                "apply",
                "deadline",
                "within",
                "must",
                "claim",
            ]
        ):
            useful.append(sentence)

        if len(useful) >= 2:
            break

    if useful:
        summary = " ".join(useful)

    elif sentences:
        summary = sentences[0]

    else:
        summary = "This notice contains information and requirements that may require action."

    if len(summary) > 500:
        summary = summary[:497].rsplit(" ", 1)[0] + "..."

    return summary


# ============================================================
# Local fallback analyzer
# ============================================================

def local_analyze(text: str) -> NoticeAnalysis:
    """
    Full local analysis used when OpenAI is unavailable.

    This is intentionally strong enough for the hackathon demo.
    """

    text = clean_text(text)

    # --------------------------------------------------------
    # Title
    # --------------------------------------------------------

    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    title = (
        lines[0]
        if lines
        else "Untitled Notice"
    )

    # Remove accidental excessive spaces
    title = re.sub(r"\s+", " ", title).strip()

    # --------------------------------------------------------
    # Deadline
    # --------------------------------------------------------

    deadline = find_deadline(text)

    # --------------------------------------------------------
    # Eligibility
    # --------------------------------------------------------

    eligibility = extract_eligibility(text)

    # --------------------------------------------------------
    # Actions
    # --------------------------------------------------------

    actions = extract_actions(text)

    # --------------------------------------------------------
    # Important points
    # --------------------------------------------------------

    important_points = extract_important_points(text)

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    summary = build_summary(
        text=text,
        title=title,
        deadline=deadline,
        eligibility=eligibility,
        actions=actions,
    )

    # --------------------------------------------------------
    # Generic fallback actions
    # --------------------------------------------------------

    if not actions:

        actions = [
            ActionItem(
                task="Review the notice and determine what applies to you.",
                completed=False,
            ),
            ActionItem(
                task="Prepare any required documents or supporting information.",
                completed=False,
            ),
        ]

        if deadline.date or deadline.relative_days:
            actions.append(
                ActionItem(
                    task="Complete the required action before the stated deadline.",
                    completed=False,
                )
            )

    return NoticeAnalysis(
        title=title,
        summary=summary,
        deadline=deadline,
        eligibility=eligibility,
        actions=actions,
        important_points=important_points,
    )


# ============================================================
# AI prompt
# ============================================================

SYSTEM_PROMPT = """
You are the core intelligence engine of Notice2Action.

Your job is to transform a notice into clear, actionable information.

Analyze the supplied notice and identify:

1. Title
2. Concise plain-English summary
3. Deadline
4. Eligibility / who is affected
5. Specific actions the user must take
6. Important consequences, warnings, or conditions

Rules:

- Never invent information.
- If a field is not present, return null or [].
- Preserve dates and times from the notice.
- Recognize relative deadlines such as:
  "within fourteen days from publication".
- Convert written numbers into integers.
- Make action items concrete and useful.
- Do not copy random sentence fragments.
- Do not turn consequences into actions unless appropriate.
- Use plain, user-friendly language.
- Return ONLY valid JSON.

JSON format:

{
  "title": "string",
  "summary": "string",
  "deadline": {
    "date": "string or null",
    "time": "string or null",
    "relative_days": "integer or null",
    "description": "string or null",
    "urgency": "low | medium | high | unknown"
  },
  "eligibility": [],
  "actions": [
    {
      "task": "string",
      "completed": false
    }
  ],
  "important_points": []
}
"""


# ============================================================
# AI analysis
# ============================================================

def ai_analyze(
    text: str,
) -> Optional[NoticeAnalysis]:

    if client is None:
        return None

    try:

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            response_format={
                "type": "json_object"
            },
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": (
                        "Analyze this notice:\n\n"
                        + text
                    ),
                },
            ],
        )

        content = (
            response
            .choices[0]
            .message
            .content
        )

        if not content:
            return None

        data = json.loads(content)

        return NoticeAnalysis.model_validate(data)

    except Exception as exc:

        print(
            "AI analysis failed:",
            exc,
        )

        return None


# ============================================================
# Public analyze function
# ============================================================

def analyze_notice(
    text: str,
) -> NoticeAnalysis:

    text = clean_text(text)

    # --------------------------------------------------------
    # Try OpenAI first
    # --------------------------------------------------------

    result = ai_analyze(text)

    if result is not None:
        return result

    # --------------------------------------------------------
    # Reliable local fallback
    # --------------------------------------------------------

    print("Using local Notice2Action analyzer.")

    return local_analyze(text)


# ============================================================
# Ask Notice
# ============================================================

def answer_question(
    text: str,
    question: str,
) -> str:

    text = clean_text(text)
    question = question.strip()

    if not question:
        return "Please enter a question about the notice."

    # --------------------------------------------------------
    # AI answer
    # --------------------------------------------------------

    if client is not None:

        try:

            ask_prompt = """
You are Notice2Action's question-answering assistant.

Answer the user's question using ONLY the supplied notice.

Rules:

- Do not invent facts.
- If the notice does not contain the answer, say so.
- Give a direct answer.
- Mention the relevant deadline when useful.
- Keep the answer concise and practical.
"""

            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": ask_prompt,
                    },
                    {
                        "role": "user",
                        "content": (
                            "NOTICE:\n"
                            + text
                            + "\n\nQUESTION:\n"
                            + question
                        ),
                    },
                ],
            )

            answer = (
                response
                .choices[0]
                .message
                .content
            )

            if answer:
                return answer.strip()

        except Exception as exc:

            print(
                "AI question answering failed:",
                exc,
            )

    # --------------------------------------------------------
    # Local fallback
    # --------------------------------------------------------

    question_lower = question.lower()

    deadline = find_deadline(text)

    # --------------------------------------------------------
    # Deadline questions
    # --------------------------------------------------------

    if any(
        word in question_lower
        for word in [
            "deadline",
            "due",
            "last date",
            "when",
            "by when",
        ]
    ):

        if deadline.date:

            answer = (
                f"The deadline mentioned in the notice is "
                f"{deadline.date}"
            )

            if deadline.time:
                answer += f" at {deadline.time}"

            return answer + "."

        if deadline.relative_days:

            return (
                "The notice requires action within "
                f"{deadline.relative_days} days "
                "from the date of publication."
            )

        return (
            "I couldn't identify a clear deadline in the notice."
        )

    # --------------------------------------------------------
    # Eligibility questions
    # --------------------------------------------------------

    if any(
        word in question_lower
        for word in [
            "eligible",
            "eligibility",
            "who can",
            "who is allowed",
            "who can participate",
        ]
    ):

        eligibility = extract_eligibility(text)

        if eligibility:
            return (
                "According to the notice: "
                + " ".join(eligibility)
            )

        return (
            "The notice does not clearly specify "
            "eligibility requirements."
        )

    # --------------------------------------------------------
    # Action questions
    # --------------------------------------------------------

    if any(
        phrase in question_lower
        for phrase in [
            "what should i do",
            "what do i do",
            "what do i need",
            "what should we do",
            "action",
            "submit",
            "apply",
            "register",
            "claim",
        ]
    ):

        actions = extract_actions(text)

        if actions:

            return "\n".join(
                f"• {action.task}"
                for action in actions
            )

        return (
            "I couldn't identify a specific action "
            "from the notice."
        )

    # --------------------------------------------------------
    # Document questions
    # --------------------------------------------------------

    if any(
        phrase in question_lower
        for phrase in [
            "documents",
            "document",
            "proof",
            "evidence",
            "what do i submit",
        ]
    ):

        lower_text = text.lower()

        if (
            "documentary proof" in lower_text
            or "proof thereof" in lower_text
        ):

            return (
                "The notice requires documentary proof "
                "supporting the claim."
            )

        if "documents" in lower_text:
            return (
                "The notice refers to supporting documents, "
                "but does not clearly specify a complete document list."
            )

        return (
            "The notice does not clearly specify the required documents."
        )

    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    return (
        "I couldn't determine the answer from the notice alone. "
        "Try asking about the deadline, eligibility, required "
        "documents, or actions."
    )