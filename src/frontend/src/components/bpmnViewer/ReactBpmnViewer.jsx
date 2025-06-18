import React, { useRef, useEffect } from "react";
import BpmnViewer from "bpmn-js/lib/Viewer";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

const ReactBpmnViewer = ({ diagramXML, height, width }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = new BpmnViewer({
      container: viewerRef.current,
    });
    
    let timeout;
    if (diagramXML) {
      timeout = setTimeout(async () => {
        viewer
          .importXML(diagramXML)
          .then(() => {
            const canvas = viewer.get("canvas");
            setTimeout(() => {
              canvas.zoom("fit-viewport", "auto");
            }, 100);

            // remove watermark logo
            const watermarkElement =
              viewerRef.current.querySelector(".bjs-powered-by");
            if (watermarkElement) {
              watermarkElement.style.display = "none"; 
            }
          })
          .catch((err) => {
            console.error("Failed to load BPMN XML:", err);
          });
      });
    }

    return () => {
      clearTimeout(timeout);
      viewer.destroy();
    };
  }, [diagramXML]);

  return (
    <div
      ref={viewerRef}
      style={{
        height: height || "25vh",
        width: width || "95%",
        margin: "0 auto",
        padding: "auto",
        overflow: "hidden",
      }}
    ></div>
  );
};

export default ReactBpmnViewer;
