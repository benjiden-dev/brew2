

export const Linkify = ({ children }: { children: string }) => {
    if (!children) return null;

    // Simple regex for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = children.split(urlRegex);

    return (
        <>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline decoration-primary/50 hover:decoration-primary transition-colors"
                            onClick={(e) => e.stopPropagation()} // Prevent card click
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};
