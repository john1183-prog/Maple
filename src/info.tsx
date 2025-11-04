type infoprops = {
  info: string;
};
function Info({ info }: infoprops) {
  return (
    <div className="m-auto text-2xl text-white">
      <p>{info}</p>
    </div>
  );
}
export default Info;
