import React from "react";
import { Link } from "react-router-dom";

// Helper for headings
const Heading = ({ level = 1, children, ...props }) => {
  const Tag = `h${level}`;
  return <Tag {...props}>{children}</Tag>;
};

// Recursive JSON renderer
export default function JSONElementRenderer({ data }) {
  if (!data) return null;

  const renderNode = (node) => {
    const { type, properties } = node;
    if (!type || !properties) return null;

    const { id, role, ariaLabel, style, className = "", children, ...rest } = properties;

    const extraProps = {
      id,
      role,
      "aria-label": ariaLabel,
      style: { ...style, transition: "all 0.3s" },
      className: className.trim(),
      ...rest,
    };

    switch (type) {
      case "section":
        return (
          <section key={id || node.id} {...extraProps}>
            {children?.map(renderNode)}
          </section>
        );

      case "heading":
        return (
          <Heading key={id || node.id} level={properties.level || 1} {...extraProps}>
            {properties.text}
          </Heading>
        );

      case "text":
        return (
          <p key={id || node.id} {...extraProps}>
            {properties.text}
          </p>
        );

      case "button":
        if (properties.url?.startsWith("/")) {
          return (
            <Link key={id || node.id} to={properties.url} {...extraProps}>
              {properties.text}
            </Link>
          );
        }
        return (
          <a key={id || node.id} href={properties.url} {...extraProps}>
            {properties.text}
          </a>
        );

      default:
        return null;
    }
  };

  return <>{Array.isArray(data) ? data.map(renderNode) : renderNode(data)}</>;
}
