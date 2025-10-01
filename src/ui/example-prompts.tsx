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
			className="group relative bg-[#2f2f2f] hover:bg-[#3f3f3f] text-gray-300 hover:text-white text-sm text-left rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
		>
			<p className="line-clamp-3">{text}</p>
		</button>
	);
};

export default ExamplePromptsConstructors;
