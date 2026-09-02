# backend/app/services/ai_service.py

import json
import os
import re
from typing import Optional, List

from dotenv import load_dotenv

load_dotenv()

from app.schemas import (
    NoticeAnalysis,
    Deadline,
    ActionItem,
)


# ============================================================
# Configuration
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

gemini_client = None
openai_client = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_client = genai
        print(f"AI CONFIG: Gemini enabled | model = {GEMINI_MODEL}")
    except Exception as exc:
        print("Gemini client initialization failed:", exc)
        gemini_client = None

if OPENAI_API_KEY and not gemini_client:
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print(f"AI CONFIG: OpenAI enabled | model = {OPENAI_MODEL}")
    except Exception as exc:
        print("OpenAI client initialization failed:", exc)
        openai_client = None

if not gemini_client and not openai_client:
    print("AI CONFIG: Running in deterministic local mode.")


# ============================================================
# Constants & Utilities
# ============================================================

MONTHS = (
    "january|february|march|april|may|june|"
    "july|august|september|october|november|december"
)

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11,
    "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30,
}


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_sentence(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip(" \t\n\r-–—:•*")
    if text and text[-1] not in ".!?":
        text += "."
    return text


def unique(items: list[str]) -> list[str]:
    result = []
    for item in items:
        item = item.strip()
        if item and item not in result:
            result.append(item)
    return result


def split_sentences(text: str) -> list[str]:
    text = clean_text(text)
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [clean_sentence(part) for part in parts if len(part.strip()) > 8]


# ============================================================
# Dynamic Notice Intelligence Extractor
# ============================================================

def extract_smart_metadata(text: str) -> dict:
    """Extract full structured field matrix dynamically from notice text."""
    lower = text.lower()
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # 1. Notice Type / Category (Dynamic)
    notice_type = "General Announcement"
    if any(k in lower for k in ["scholarship", "fellowship", "financial aid", "grant"]):
        notice_type = "Scholarship / Financial Aid"
    elif any(k in lower for k in ["course registration", "academic registration", "semester registration", "portal opens"]):
        notice_type = "Academic Registration"
    elif any(k in lower for k in ["exam", "examination", "timetable", "hall ticket", "admit card"]):
        notice_type = "Examination Schedule"
    elif any(k in lower for k in ["admission", "counseling", "seat allotment", "enrollment"]):
        notice_type = "Admission Notification"
    elif any(k in lower for k in ["claim", "property", "legal", "court", "title dispute", "objection"]):
        notice_type = "Legal / Public Claim Notice"
    elif any(k in lower for k in ["recruitment", "vacancy", "job post", "walk-in interview"]):
        notice_type = "Recruitment Notification"
    elif any(k in lower for k in ["tender", "quotation", "procurement", "bid"]):
        notice_type = "Tender / Procurement Notice"
    elif any(k in lower for k in ["fee", "dues", "payment"]):
        notice_type = "Fee Payment Circular"

    # 2. Title (Dynamic)
    title = lines[0] if lines else "Official Announcement"
    for line in lines[:8]:
        sub_match = re.match(r"(?i)^(?:sub|subject|regarding|re|title|notice for|circular regarding)\s*[:\-–]\s*(.+)$", line)
        if sub_match:
            title = sub_match.group(1).strip(" .:-–—")
            break
        elif any(k in line.lower() for k in ["registration", "scholarship", "examination", "notice", "application", "claim", "tender"]) and len(line) > 10:
            title = line.strip(" .:-–—*#")
            break

    # 3. Target Audience (Dynamic - supports both Year+Branch and Branch+Year permutations)
    target_audience = None
    branch_regex = r"(?:cse|ece|it|eee|mech|mechanical|civil|aids|aiml|csbs|csd|iot|cyber\s*security|computer\s*science(?:\s*(?:and|&)\s*engineering)?|information\s*technology|b\.?tech|m\.?tech|mca|mba)"
    year_regex = r"(?:[1-4](?:st|nd|rd|th)?\s*year|first\s*year|second\s*year|third\s*year|fourth\s*year|final\s*year)"

    # Match: Branch + Year (e.g. "CSE students 2nd year", "CSE 2nd year students")
    branch_year_match = re.search(rf"(?i)\b({branch_regex}\s*(?:students?|candidates?)?\s*(?:of\s+)?{year_regex}(?:\s*students?)?[^\n\r\.;]{{0,30}})", text)
    # Match: Year + Branch (e.g. "2nd year CSE students", "2nd year CSE")
    year_branch_match = re.search(rf"(?i)\b({year_regex}\s*(?:of\s+)?{branch_regex}(?:\s*students?)?[^\n\r\.;]{{0,30}})", text)

    if branch_year_match:
        target_audience = branch_year_match.group(1).strip().title()
    elif year_branch_match:
        target_audience = year_branch_match.group(1).strip().title()
    elif re.search(rf"(?i)\b({branch_regex}\s+students?(?:\s*only)?)\b", text):
        target_audience = re.search(rf"(?i)\b({branch_regex}\s+students?(?:\s*only)?)\b", text).group(1).strip().title()
    elif "2nd year" in lower or "second year" in lower:
        target_audience = "2nd Year Students"
    elif "final year" in lower or "4th year" in lower:
        target_audience = "Final Year Students"
    elif "3rd year" in lower or "third year" in lower:
        target_audience = "3rd Year Students"
    elif "1st year" in lower or "first year" in lower:
        target_audience = "1st Year Students"
    elif "all students" in lower or "registered students" in lower:
        target_audience = "All Students"
    elif "undergraduate" in lower:
        target_audience = "Undergraduate Students"
    elif "postgraduate" in lower or "m.tech" in lower or "ph.d" in lower:
        target_audience = "Postgraduate / Research Scholars"
    elif "faculty" in lower or "staff" in lower:
        target_audience = "Teaching & Non-Teaching Staff"
    elif "claimant" in lower or "property" in lower or "public" in lower:
        target_audience = "General Public / Interested Claimants"
    elif "bidders" in lower or "contractors" in lower:
        target_audience = "Eligible Contractors & Bidders"
    else:
        target_audience = "Concerned Stakeholders"

    # 4. Action Required (Dynamic)
    action_required = None
    if "online registration" in lower or "register online" in lower:
        action_required = "Complete online registration"
    elif "submit application" in lower or "apply online" in lower:
        action_required = "Submit online application form with attachments"
    elif "make claim" in lower or "objection" in lower or "claim in writing" in lower:
        action_required = "Submit written objection/claim with documentary proof"
    elif "fee payment" in lower or "deposit fee" in lower:
        action_required = "Pay prescribed dues/fees before closing date"
    elif "verification" in lower or "document verification" in lower:
        action_required = "Attend physical document verification"
    else:
        # Extract first imperative statement
        for s in split_sentences(text):
            if any(k in s.lower() for k in ["must", "required to", "directed to", "requested to", "submit", "apply", "register"]):
                action_required = s
                break
    if not action_required:
        action_required = "Review circular and comply with stated instructions"

    # 5. Dates (Start date & Deadline)
    date_patterns = [
        rf"(?i)\b(\d{{1,2}}\s+(?:{MONTHS})\s+\d{{4}})\b",
        rf"(?i)\b((?:{MONTHS})\s+\d{{1,2}},?\s+\d{{4}})\b",
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
    ]
    all_dates = []
    for pattern in date_patterns:
        for m in re.finditer(pattern, text):
            all_dates.append(m.group(1))

    start_date = None
    start_match = re.search(rf"(?i)(?:opens?|starts?|from|commencing)\s*[:\-–]?\s*(\d{{1,2}}\s+(?:{MONTHS})\s+\d{{4}}|\d{{1,2}}[/-]\d{{1,2}}[/-]\d{{2,4}})", text)
    if start_match:
        start_date = start_match.group(1)
    elif len(all_dates) >= 2:
        start_date = all_dates[0]

    deadline_date = None
    time_val = None
    dead_match = re.search(rf"(?i)(?:deadline|last date|closing date|before|by|ends?|on or before)\s*[:\-–]?\s*(\d{{1,2}}\s+(?:{MONTHS})\s+\d{{4}}|\d{{1,2}}[/-]\d{{1,2}}[/-]\d{{2,4}})", text)
    if dead_match:
        deadline_date = dead_match.group(1)
    elif all_dates:
        deadline_date = all_dates[-1]

    time_match = re.search(r"(?i)\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|hrs|hours))\b", text)
    if time_match:
        time_val = time_match.group(1)

    relative_days = None
    relative_pattern = re.search(
        rf"(?i)\b(?:within|within a period of)\s+(\d+|{'|'.join(NUMBER_WORDS.keys())})\s+(day|days|week|weeks)\b",
        text,
    )
    if relative_pattern:
        num_str = relative_pattern.group(1).lower()
        val = int(num_str) if num_str.isdigit() else NUMBER_WORDS.get(num_str)
        if val:
            if "week" in relative_pattern.group(2).lower():
                val *= 7
            relative_days = val
            if not deadline_date:
                deadline_date = f"Within {val} days of publication"

    # 6. Penalty / Consequences (Dynamic: None if absent)
    penalty = None
    penalty_match = re.search(r"(?i)(?:late registrations? will attract|late fee of|penalty of|fine of|late fee|penalty|fine|failing which|failure to|will not be entertained|rejected without)\s*[:\-–]?\s*(₹?\s*\d+[\w\s\.,]+|[^\n\r\.;]{10,80})", text)
    if penalty_match:
        penalty = penalty_match.group(0).strip(" .:-–—")
        if len(penalty) > 80:
            penalty = penalty[:77] + "..."

    # 7. Documents Required (Dynamic: only what is mentioned)
    docs = []
    doc_section = re.search(r"(?i)(?:documents? required|enclosures?|attachments?|documents? to be submitted)\s*[:\-–]?\s*([^\n\r]+(?:\n[^\n\r]+){0,5})", text)
    if doc_section:
        raw_docs = doc_section.group(1)
        for item in re.split(r"[,;\n•\d+\.]", raw_docs):
            cleaned = item.strip(" .:-–—*")
            if len(cleaned) > 2 and not any(k in cleaned.lower() for k in ["contact", "where", "important", "dates"]):
                docs.append(cleaned)

    if not docs:
        if any(k in lower for k in ["id proof", "aadhaar", "passport", "identity proof", "voter id"]):
            docs.append("Government Photo ID Proof")
        if any(k in lower for k in ["marksheet", "grade card", "academic record", "transcript"]):
            docs.append("Academic Marksheet / Grade Record")
        if any(k in lower for k in ["photograph", "photo"]):
            docs.append("Recent Passport-size Photograph")
        if any(k in lower for k in ["contact details", "phone", "email"]):
            docs.append("Contact Details")
        if any(k in lower for k in ["documentary proof", "proof thereof", "title deed"]):
            docs.append("Documentary Proof of Claim / Title")

    docs = unique(docs)[:6]

    # 8. Where to Act (Dynamic)
    where_to_act = None
    if "national scholarship portal" in lower or "nsp" in lower:
        where_to_act = "National Scholarship Portal"
    elif "student portal" in lower:
        where_to_act = "Student Portal"
    elif "college portal" in lower:
        where_to_act = "College Portal"
    elif "admission portal" in lower:
        where_to_act = "Admission Portal"
    elif "college office" in lower or "admin office" in lower:
        where_to_act = "Academic Administration Office"
    else:
        where_match = re.search(r"(?i)(?:where to apply|where to act|submit at|register at)\s*[:\-–]?\s*([A-Za-z0-9\.\-_/:\s]{4,40})", text)
        if where_match:
            where_to_act = where_match.group(1).strip(" .:-–—")
        elif "portal" in lower or "online" in lower:
            where_to_act = "Official Online Portal"

    # 9. Contact / Authority (Dynamic)
    contact = None
    contact_match = re.search(r"(?i)(?:contact|office of|authority|inquiries|reach out to|issued by)\s*[:\-–]\s*([^\n\r\.;]{4,60})", text)
    if contact_match:
        contact = contact_match.group(1).strip(" .:-–—")
    elif "administration" in lower:
        contact = "Administration Office"

    # 10. Eligibility Criteria (Dynamic)
    eligibility = []
    # A. Check if eligibility is stated on one line
    single_elig = re.search(r"(?i)(?:eligibility criteria|eligibility|who is eligible|who can apply|eligible branches|eligible candidates?)\s*[:\-–]\s*([^\n\r]+)", text)
    if single_elig:
        first_line = clean_sentence(re.sub(r"^\s*(?:\d+[\.\)]|\•|\-|\*)\s*", "", single_elig.group(1)))
        if len(first_line) >= 4:
            eligibility.append(first_line)
            # Check if followed by numbered or bulleted lines
            after_pos = single_elig.end()
            remaining = text[after_pos:].split("\n")
            for rline in remaining[1:6]:
                if re.match(r"^\s*(?:\d+[\.\)]|\•|\-|\*)\s*", rline):
                    cleaned_r = clean_sentence(re.sub(r"^\s*(?:\d+[\.\)]|\•|\-|\*)\s*", "", rline))
                    if len(cleaned_r) >= 5:
                        eligibility.append(cleaned_r)
                else:
                    break

    # B. Year / Branch / Student specific restrictions
    if not eligibility:
        branch_pat = r"(?:cse|ece|it|eee|mech|mechanical|civil|aids|aiml|csbs|csd|iot|cyber\s*security|computer\s*science(?:\s*(?:and|&)\s*engineering)?|information\s*technology|b\.?tech|m\.?tech|mca|mba)"
        year_pat = r"(?:[1-4](?:st|nd|rd|th)?\s*year|first\s*year|second\s*year|third\s*year|fourth\s*year|final\s*year)"
        spec_patterns = [
            rf"(?i)\b((?:only\s+)?{year_pat}\s*(?:of\s+)?{branch_pat}(?:\s*students?)?[^\n\r\.;]{{0,50}}(?:only|eligible|invited)?)",
            rf"(?i)\b((?:only\s+)?{branch_pat}\s*(?:students?|candidates?)?\s*(?:of\s+)?{year_pat}(?:\s*students?)?[^\n\r\.;]{{0,50}}(?:only|eligible|invited)?)",
        ]
        for sp in spec_patterns:
            for sm in re.finditer(sp, text):
                crit_text = clean_sentence(sm.group(1))
                if len(crit_text) >= 6:
                    eligibility.append(crit_text)

    # C. Inline rule patterns
    if not eligibility:
        patterns = [
            r"(?:only\s+)?(?:students?|candidates?)\s+of\s+.{5,120}?(?:eligible|can participate|can apply)",
            r"candidates? (?:who|with|having|enrolled).{5,120}?(?:eligible|can apply|required)",
            r"applicants must (?:have|be|possess).{5,120}",
            r"minimum (?:cgpa|marks|percentage|qualification).{0,120}",
            r"open (?:exclusively|only)\s+for\s+[^\n\r\.;]{5,80}",
            r"only .{5,100}?(?:eligible|allowed|invited|considered)",
        ]
        for pattern in patterns:
            for match in re.findall(pattern, text, flags=re.IGNORECASE):
                val = clean_sentence(match)
                if len(val) >= 8:
                    eligibility.append(val)

    if not eligibility and target_audience and target_audience != "Concerned Stakeholders":
        eligibility.append(f"{target_audience} only.")

    eligibility = unique(eligibility)[:5]

    # 11. Priority & Urgency (Dynamic)
    urgency = "low"
    priority = "🟢 Low"
    if any(k in lower for k in ["urgent", "immediately", "mandatory", "last chance", "penalty", "failing which"]):
        urgency = "high"
        priority = "🔴 High"
    elif deadline_date or relative_days:
        urgency = "medium"
        priority = "🟡 Medium"

    # 12. Status (Dynamic)
    status = "Action Required" if (deadline_date or action_required) else "Information Only"

    return {
        "title": title.title(),
        "notice_type": notice_type,
        "category": notice_type,
        "target_audience": target_audience,
        "eligibility": eligibility,
        "action_required": action_required,
        "deadline_date": deadline_date,
        "start_date": start_date,
        "time": time_val,
        "relative_days": relative_days,
        "penalty": penalty,
        "documents_required": docs,
        "where_to_act": where_to_act,
        "contact": contact,
        "priority": priority,
        "status": status,
        "urgency": urgency,
    }


# ============================================================
# Local Deterministic Analyzer
# ============================================================

def local_analyze(text: str) -> NoticeAnalysis:
    text = clean_text(text)
    meta = extract_smart_metadata(text)

    deadline = Deadline(
        date=meta["deadline_date"],
        time=meta["time"],
        relative_days=meta["relative_days"],
        description=f"Action deadline: {meta['deadline_date']}" if meta["deadline_date"] else None,
        urgency=meta["urgency"],
    )

    actions = []
    if meta["action_required"]:
        actions.append(ActionItem(task=meta["action_required"], completed=False))
    if meta["documents_required"]:
        actions.append(ActionItem(task=f"Gather required documents: {', '.join(meta['documents_required'][:3])}", completed=False))
    if meta["where_to_act"]:
        actions.append(ActionItem(task=f"Submit via {meta['where_to_act']} before {meta['deadline_date'] or 'closing'}", completed=False))
    if not actions:
        actions.append(ActionItem(task="Review circular terms and requirements.", completed=False))

    summary_lines = [
        f"📌 WHAT THIS NOTICE IS ABOUT:\nThis is an official {meta['notice_type']} announcement regarding \"{meta['title']}\".",
        f"\n👥 WHO IT APPLIES TO:\n{meta['target_audience']}",
        f"\n🎯 CORE ACTION REQUIRED:\n{meta['action_required']}" + (f" on {meta['where_to_act']}" if meta['where_to_act'] else "") + (f" by {meta['deadline_date']}." if meta['deadline_date'] else "."),
    ]
    if meta["penalty"]:
        summary_lines.append(f"\n⚠️ PENALTY / CONSEQUENCE:\n{meta['penalty']}")

    summary = "\n".join(summary_lines)

    return NoticeAnalysis(
        title=meta["title"],
        notice_type=meta["notice_type"],
        category=meta["notice_type"],
        target_audience=meta["target_audience"],
        action_required=meta["action_required"],
        deadline=deadline,
        start_date=meta["start_date"],
        penalty=meta["penalty"],
        documents_required=meta["documents_required"],
        where_to_act=meta["where_to_act"],
        contact=meta["contact"],
        priority=meta["priority"],
        status=meta["status"],
        summary=summary,
        eligibility=meta["eligibility"],
        actions=actions,
        important_points=meta["documents_required"],
    )


# ============================================================
# AI Prompt Templates (Gemini / OpenAI)
# ============================================================

SYSTEM_PROMPT = """You are the core document intelligence engine of Notice2Action.
Analyze the supplied notice and extract ALL structured operational fields dynamically based purely on the specific text provided. Do NOT use placeholder or default assumptions.

Output ONLY valid JSON matching this schema:
{
  "title": "Specific Topic Title extracted from text",
  "notice_type": "Specific type (e.g. Scholarship, Legal Notice, Exam Schedule, Fee Notice, Recruitment)",
  "category": "Matching category name",
  "target_audience": "Specific audience mentioned in notice (e.g. Final Year B.Tech, All Students, Public Claimants, Bidders)",
  "eligibility": [
    "Specific condition 1",
    "Specific condition 2"
  ],
  "action_required": "Direct specific task the user must execute",
  "deadline": {
    "date": "Extracted deadline date (e.g. '18 September 2026') or null",
    "time": "Extracted time (e.g. '11:59 PM') or null",
    "relative_days": null,
    "description": "Deadline description or null",
    "urgency": "high | medium | low"
  },
  "start_date": "Extracted start date (e.g. '01 August 2026') or null",
  "penalty": "Extracted penalty / fine / consequence or null if not stated",
  "documents_required": [
    "Extracted document 1",
    "Extracted document 2"
  ],
  "where_to_act": "Extracted portal, URL, or office to complete action or null",
  "contact": "Extracted contact department / office or null",
  "priority": "🔴 High | 🟡 Medium | 🟢 Low",
  "status": "Action Required | Information Only",
  "summary": "📌 WHAT THIS NOTICE IS ABOUT: ...\\n👥 WHO IT APPLIES TO: ...\\n🎯 CORE ACTION REQUIRED: ...",
  "actions": [
    {"task": "Specific actionable step 1", "completed": false},
    {"task": "Specific actionable step 2", "completed": false}
  ],
  "important_points": [
    "Important condition or document 1"
  ]
}"""

ASK_PROMPT = """You are Notice2Action's grounded document assistant.
Answer the user's question clearly and concisely using ONLY the provided notice.
If the notice does not mention the answer, explicitly state that it is not specified in the notice."""


# ============================================================
# AI Execution
# ============================================================

def ai_analyze_gemini(text: str) -> Optional[NoticeAnalysis]:
    if not gemini_client:
        return None
    try:
        model = gemini_client.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={"response_mime_type": "application/json", "temperature": 0.1}
        )
        prompt = f"{SYSTEM_PROMPT}\n\nNotice text to analyze:\n{text}"
        response = model.generate_content(prompt)
        if response and response.text:
            data = json.loads(response.text)
            return NoticeAnalysis.model_validate(data)
    except Exception as exc:
        print("Gemini analysis error:", exc)
    return None


def ai_analyze_openai(text: str) -> Optional[NoticeAnalysis]:
    if not openai_client:
        return None
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this notice:\n\n{text}"}
            ]
        )
        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            return NoticeAnalysis.model_validate(data)
    except Exception as exc:
        print("OpenAI analysis error:", exc)
    return None


def analyze_notice(text: str) -> NoticeAnalysis:
    text = clean_text(text)

    # 1. Google Gemini
    if gemini_client:
        result = ai_analyze_gemini(text)
        if result is not None:
            return result

    # 2. OpenAI
    if openai_client:
        result = ai_analyze_openai(text)
        if result is not None:
            return result

    # 3. Local Deterministic Fallback
    return local_analyze(text)


def answer_question(text: str, question: str) -> str:
    text = clean_text(text)
    question = question.strip()
    if not question:
        return "Please enter a question about the notice."

    if gemini_client:
        try:
            model = gemini_client.GenerativeModel(model_name=GEMINI_MODEL)
            prompt = f"{ASK_PROMPT}\n\nNOTICE:\n{text}\n\nUSER QUESTION:\n{question}"
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as exc:
            print("Gemini Q&A error:", exc)

    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model=OPENAI_MODEL,
                temperature=0,
                messages=[
                    {"role": "system", "content": ASK_PROMPT},
                    {"role": "user", "content": f"NOTICE:\n{text}\n\nQUESTION:\n{question}"}
                ]
            )
            content = response.choices[0].message.content
            if content:
                return content.strip()
        except Exception as exc:
            print("OpenAI Q&A error:", exc)

    # Fallback
    meta = extract_smart_metadata(text)
    q_low = question.lower()
    if "deadline" in q_low or "last date" in q_low or "when" in q_low:
        return f"The deadline is {meta['deadline_date'] or 'not specified in notice'}."
    if "document" in q_low or "proof" in q_low:
        return f"Required documents: {', '.join(meta['documents_required']) if meta['documents_required'] else 'None specifically listed'}."
    if "who" in q_low or "eligible" in q_low:
        return f"Target audience: {meta['target_audience']}."
    if "penalty" in q_low or "fee" in q_low or "late" in q_low:
        return f"Penalty/Consequence: {meta['penalty'] or 'None specified in notice'}."
    if "where" in q_low or "portal" in q_low:
        return f"Action location: {meta['where_to_act'] or 'Refer to official notice channels'}."
    return f"Notice regarding {meta['title']}. Action required: {meta['action_required']}."