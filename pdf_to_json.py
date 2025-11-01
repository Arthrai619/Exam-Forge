import re
import json
from PyPDF2 import PdfReader

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_questions(text):
    # Split text by numbered questions (e.g., "1. ", "2. ", etc.)
    question_blocks = re.split(r"\n?\s*(\d+)\.\s", text)[1:]  # remove prefix junk
    questions = []

    for i in range(0, len(question_blocks), 2):
        number = int(question_blocks[i])
        block = question_blocks[i+1].strip()

        # Extract question, options, and answer
        parts = re.split(r"\bA\)|B\)|C\)|D\)", block)
        if len(parts) < 5:
            continue  # skip malformed ones

        question = parts[0].strip()
        options = re.findall(r"([ABCD])\)\s*([^\n]+)", block)
        answer_match = re.search(r"Ans:\s*([A-D])", block)

        # Create structured data
        qdata = {
            "question_number": number,
            "question": question,
            "options": {opt[0]: opt[1].strip() for opt in options},
            "answer": [answer_match.group(1)] if answer_match else []
        }
        questions.append(qdata)

    return questions

def pdf_to_json(pdf_path, output_path="output.json"):
    text = extract_text_from_pdf(pdf_path)
    questions = parse_questions(text)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=4, ensure_ascii=False)

    print(f"✅ Successfully extracted {len(questions)} questions to {output_path}")

if __name__ == "__main__":
    pdf_to_json(r"D:\Mini Proect\quiz_sets\1.pdf", "questions.json")
