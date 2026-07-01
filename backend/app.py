from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import io
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)

# FIXED CORS (important)
CORS(app, resources={r"/*": {"origins": "*"}})

# AI MODEL
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/")
def home():
    return "Backend Running Successfully"

# Extract PDF text
def extract_text(file):
    text = ""
    with pdfplumber.open(io.BytesIO(file.read())) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text

# AI analysis engine
def analyze_resume(resume_text, jd_text):

    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    jd_embedding = model.encode(jd_text, convert_to_tensor=True)

    similarity = util.cos_sim(resume_embedding, jd_embedding).item()
    ats_score = round((similarity + 1) * 50)

    keywords = [
        "python", "java", "c++", "react", "sql",
        "aws", "docker", "flask", "django",
        "tensorflow", "machine learning", "html", "css"
    ]

    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    found_skills = [k for k in keywords if k in resume_lower]
    missing_skills = [k for k in keywords if k in jd_lower and k not in resume_lower]

    return {
        "ats_score": min(max(ats_score, 0), 100),
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "suggestions": [
            "Match resume keywords with job description",
            "Add measurable achievements",
            "Improve project descriptions",
            "Highlight relevant technologies clearly"
        ]
    }

# API endpoint
@app.route("/analyze", methods=["POST"])
def analyze():
    print("\n========== NEW REQUEST ==========")

    try:
        resume_file = request.files.get("resume")
        jd = request.form.get("jd")

        print("Resume received:", resume_file.filename if resume_file else "No file")
        print("Job Description length:", len(jd) if jd else 0)

        if not resume_file or not jd:
            print("Missing data")
            return jsonify({"error": "Missing resume or job description"}), 400

        resume_text = extract_text(resume_file)
        print("Resume extracted successfully")

        result = analyze_resume(resume_text, jd)

        print("Analysis completed")
        print(result)

        return jsonify(result)

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)