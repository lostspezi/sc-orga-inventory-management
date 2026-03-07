"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type Props = {
    body: string;
};

export default function NewsMarkdownBody({ body }: Props) {
    return (
        <div
            className="prose prose-invert prose-sm max-w-none"
            style={{ color: "rgba(200,220,232,0.8)" }}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {body}
            </ReactMarkdown>
        </div>
    );
}
