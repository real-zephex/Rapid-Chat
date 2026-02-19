const ExamplePromptsConstructors = ({
	text,
	onClick,
}: {
	text: string;
	onClick: (text: string) => void;
}) => {
	return (
		<button
			onClick={() => onClick(text)}
			className="group relative bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-sm text-left rounded-2xl p-4 border border-border transition-all cursor-pointer shadow-sm hover:shadow-md"
		>
			<p className="line-clamp-3">{text}</p>
		</button>
	);
};

export default ExamplePromptsConstructors;
