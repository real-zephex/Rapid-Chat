import GetStarted from "@/ui/get-started";

export default function Home() {
  return (
    <div className=" bg-black/90 rounded-xl w-full overflow-y-auto">
      <div className="w-full h-full flex flex-col  justify-center p-8 lg:p-28 gap-4">
        <p className="text-2xl lg:text-4xl">
          Welcome to <span className="text-teal-200 font-bold">FastChat !</span>
        </p>
        <p className="tracking-wider text-sm lg:text-lg">
          My attempt at making superfast AI interfaces so you don&#39;t have to
          wait for LLMs to respond.
        </p>
        <GetStarted />
      </div>
    </div>
  );
}
