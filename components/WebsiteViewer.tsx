import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const WebsiteViewer = () => {
  const { id } = useParams();
  const [html, setHtml] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "websites", id!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setHtml(docSnap.data().html);
      }
    };

    fetchData();
  }, [id]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default WebsiteViewer;