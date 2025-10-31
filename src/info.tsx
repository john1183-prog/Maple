type infoprops = {
  info: string;
};
function Info({ info }: infoprops) {
  return (
    <div className="w-full text-white bg-gradient-to-l from-blue-500 to-purple-600 m-auto rounded-lg p-2 px-1 text-2xl">
      <p>{info}</p>
    </div>
  );
}
export default Info;
