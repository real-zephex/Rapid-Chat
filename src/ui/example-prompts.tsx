const ExamplePromptsConstructors = ({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-transparent text-white/70 text-sm w-full cursor-pointer hover:text-white/90 transition-colors hover:bg-neutral-800/50 rounded-lg p-3"
      onClick={() => onClick(text)}
    >
      <p >{text}</p>
    </div>
  );
};

export default ExamplePromptsConstructors;
