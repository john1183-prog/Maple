type btnprops = {
  option: string;
  src: string;
  onClick: () => void;
};
function Option({ option, src, onClick }: btnprops) {
  return (
    <div
      className="w-full text-white bg-gradient-to-l from-blue-500 to-purple-600 m-auto rounded-lg p-2 px-1 text-2xl cursor-pointer hover:scale-101"
      onClick={onClick}
    >
      <div>
        <img src={src} alt="alternative" />
      </div>
      <p>This is {option}</p>
    </div>
  );
}
export default Option;
