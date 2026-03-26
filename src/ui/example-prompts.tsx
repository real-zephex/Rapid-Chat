const ExamplePromptsConstructors = ({
	text,
	onClick,
}: {
	text: string;
	onClick: (text: string) => void;
}) => {
	return (
		<button
			type="button"
			onClick={() => onClick(text)}
			className="group relative rounded-2xl border border-border bg-surface p-4 text-left text-sm text-text-secondary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:bg-background hover:text-text-primary"
		>
			<p className="line-clamp-3 leading-relaxed">{text}</p>
		</button>
	);
};

export default ExamplePromptsConstructors;
