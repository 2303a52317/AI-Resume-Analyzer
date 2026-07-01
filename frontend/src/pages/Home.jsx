import "../styles/Home.css";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";

function Home() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // File upload
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  // Analyze Resume
  const handleAnalyze = async () => {
    if (!file) return alert("Please upload resume");
    if (!jobDescription.trim()) return alert("Please add job description");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jd", jobDescription);

      const response = await axios.post(
        "http://localhost:5000/analyze",
        formData
      );

      console.log("RESULT:", response.data);
      setResult(response.data);

    } catch (error) {
      console.log("ERROR:", error);
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  return (
    <div className="home-container">

      {/* HERO SECTION */}
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>AI Resume Analyzer</h1>
        <p>
          Upload your resume and job description to get ATS score, skill match, and suggestions.
        </p>
      </motion.div>

      {/* UPLOAD SECTION */}
      <motion.div
        className="upload-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* DROPZONE */}
        <div {...getRootProps()} className="drop-zone">
          <input {...getInputProps()} />
          <FaCloudUploadAlt size={60} />
          <h2>Drag & Drop Resume</h2>
          <p>or click to upload PDF</p>

          {file && (
            <div className="file-name">
              Selected: {file.name}
            </div>
          )}
        </div>

        {/* JOB DESCRIPTION */}
        <textarea
          placeholder="Paste Job Description Here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        {/* BUTTON */}
        <button
  onClick={() => {
    console.log("BUTTON WORKS");
    handleAnalyze();
  }}
  disabled={loading}
>
  {loading ? "Analyzing..." : "Analyze Resume"}
</button>

        {/* RESULT */}
        {result && (
          <div className="result-box">

            <h3>ATS Score: {result.ats_score}%</h3>

            <h4>Skills Found:</h4>
            <ul>
              {result.found_skills?.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>

            <h4>Missing Skills:</h4>
            <ul>
              {result.missing_skills?.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>

            <h4>Suggestions:</h4>
            <ul>
              {result.suggestions?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

          </div>
        )}

      </motion.div>
    </div>
  );
}

export default Home;