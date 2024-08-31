// import React, { useEffect, useState } from "react";

// interface Asset {
//   key: string;
//   url: string;
// }

// interface AssetViewProps {
//   asset: Asset;
//   onClose: () => void;
//   onDelete: () => void;
// }

// const AssetView: React.FC<AssetViewProps> = ({ asset, onClose, onDelete }) => {
//   const [jsonData, setJsonData] = useState<string | null>(null);
//   const [copySuccess, setCopySuccess] = useState<string | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchJsonData = async () => {
//       if (asset.url.endsWith(".json")) {
//         try {
//           const response = await fetch(asset.url);
//           const data = await response.json();
//           if (isMounted) {
//             setJsonData(JSON.stringify(data, null, 2));
//           }
//         } catch (error) {
//           console.error("Error fetching JSON data:", error);
//         }
//       }
//     };

//     fetchJsonData();

//     return () => {
//       isMounted = false;
//     };
//   }, [asset.url]);

//   const syntaxHighlight = (json: string) => {
//     if (!json) return "";

//     return json
//       .replace(/(&)/g, '&amp;')
//       .replace(/(>)/g, '&gt;')
//       .replace(/(<)/g, '&lt;')
//       .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*?"(\s*:)?|\b(true|false|null)\b|\d+)/g, (match) => {
//         let cls = "number";
//         if (/^"/.test(match)) {
//           if (/:$/.test(match)) {
//             cls = "key";
//           } else {
//             cls = "string";
//           }
//         } else if (/true|false/.test(match)) {
//           cls = "boolean";
//         } else if (/null/.test(match)) {
//           cls = "null";
//         }
//         return `<span class="${cls}">${match}</span>`;
//       });
//   };

//   const copyToClipboard = () => {
//     if (!jsonData) return;

//     // Ensure the component is still mounted before attempting state update
//     let isMounted = true;
//     navigator.clipboard.writeText(jsonData).then(
//       () => {
//         if (isMounted) {
//           setCopySuccess("Copied to clipboard!");
//           setTimeout(() => {
//             if (isMounted) setCopySuccess(null);
//           }, 2000); // Clear message after 2 seconds
//         }
//       },
//       (err) => {
//         if (isMounted) {
//           setCopySuccess("Failed to copy!");
//           setTimeout(() => {
//             if (isMounted) setCopySuccess(null);
//           }, 2000); // Clear message after 2 seconds
//         }
//         console.error("Failed to copy JSON to clipboard", err);
//       }
//     );

//     return () => {
//       isMounted = false;
//     };
//   };

//   return (
//     <div className="asset-view">
//       <div className="asset-view-content">
//         {asset.url.endsWith(".json") ? (
//           <>
//             <pre dangerouslySetInnerHTML={{ __html: jsonData ? syntaxHighlight(jsonData) : "Loading JSON..." }} />
//             <button onClick={copyToClipboard} className="copy-json-button">
//               Copy Raw JSON
//             </button>
//             {copySuccess && <div className="copy-feedback">{copySuccess}</div>}
//           </>
//         ) : (
//           <img src={asset.url} alt="Viewing Asset" />
//         )}
//       </div>
//       <div className="asset-view-actions">
//         <button onClick={() => window.open(asset.url, "_blank")}>
//           View Asset on-chain
//         </button>
//         <button onClick={onClose}>Close</button>
//         <button onClick={onDelete}>Delete</button>
//       </div>
//     </div>
//   );
// };

// export default AssetView;