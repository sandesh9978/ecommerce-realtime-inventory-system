import React from "react";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
  strong: ({node, ...props}) => <i {...props} />,
};

const Markdown = ({ children }) => (
  <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
);

export default Markdown; 