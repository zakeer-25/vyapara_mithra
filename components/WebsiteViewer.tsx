import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const WebsiteViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!id) { setLoading(false); setNotFound(true); return; }

    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "websites", id));
        if (docSnap.exists()) {
          setHtml(docSnap.data().html as string);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load website:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0f172a", color: "#fff",
        fontFamily: "'Outfit', sans-serif", gap: "16px",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid #059669",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>Loading your website...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0f172a", color: "#fff",
        fontFamily: "'Outfit', sans-serif", gap: "12px",
        padding: "24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 52 }}>🔍</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Website not found</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 300, margin: 0 }}>
          This link may be invalid or the website was removed.
        </p>
        <a href="/" style={{
          marginTop: 16, padding: "12px 28px",
          background: "#059669", color: "white",
          borderRadius: 999, textDecoration: "none",
          fontWeight: 600, fontSize: 15,
        }}>
          Create your own website
        </a>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default WebsiteViewer;
