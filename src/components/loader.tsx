const Spinner = () => {
  return (
    <>
      <section className="h-dvh flex flex-col gap-4 justify-center items-center">
        <div className="border-2 border-blue-950 border-t-pink-200 h-20 w-20 rounded-full animate-spin align-middle"></div>
        <span className="align-middle">Loading...</span>
      </section>
    </>
  );
};

export default Spinner;
