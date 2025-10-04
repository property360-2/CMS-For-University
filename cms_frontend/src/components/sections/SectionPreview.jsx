import React from "react";

export default function SectionPreview({ section, theme = "default" }) {
  const themeClasses = {
    default: {
      heading: "text-2xl font-bold text-gray-900 my-4",
      paragraph: "text-gray-700 my-2",
      button:
        "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block",
      table: "border-collapse border border-gray-300 w-full",
      td: "border border-gray-300 px-4 py-2",
      image: "rounded-lg shadow-md",
    },
    dark: {
      heading: "text-2xl font-bold text-white my-4",
      paragraph: "text-gray-300 my-2",
      button:
        "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block",
      table: "border-collapse border border-gray-700 w-full",
      td: "border border-gray-700 px-4 py-2 text-gray-200",
      image: "rounded-lg shadow-lg",
    },
    light: {
      heading: "text-2xl font-bold text-gray-900 my-4",
      paragraph: "text-gray-600 my-2",
      button:
        "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 inline-block",
      table: "border-collapse border border-gray-300 w-full",
      td: "border border-gray-300 px-4 py-2",
      image: "rounded-lg shadow",
    },
    purple: {
      heading: "text-2xl font-bold text-purple-900 my-4",
      paragraph: "text-purple-800 my-2",
      button:
        "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block",
      table: "border-collapse border border-purple-300 w-full",
      td: "border border-purple-300 px-4 py-2",
      image: "rounded-lg shadow-lg",
    },
  };

  const classes = themeClasses[theme] || themeClasses.default;

  switch (section.type) {
    case "heading":
      return (
        <h2 className={classes.heading}>
          {section.properties.text || "Heading"}
        </h2>
      );

    case "paragraph":
      return (
        <p className={classes.paragraph}>
          {section.properties.text || "Paragraph text"}
        </p>
      );

    case "button":
      return (
        <a
          href={section.properties.href || "#"}
          className={classes.button}
          target="_blank"
          rel="noopener noreferrer"
        >
          {section.properties.text || "Button"}
        </a>
      );

    case "image":
      return section.properties.url ? (
        <img
          src={section.properties.url}
          alt={section.properties.alt || "Image"}
          className={classes.image}
        />
      ) : (
        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center text-gray-500">
          No image URL
        </div>
      );

    case "table":
      return (
        <table className={classes.table}>
          <tbody>
            {(section.properties.rows || [[]]).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={classes.td}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    default:
      return (
        <div className="text-gray-500">
          Unknown section type: {section.type}
        </div>
      );
  }
}
