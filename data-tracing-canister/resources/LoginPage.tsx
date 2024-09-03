// imports here .....

const LoginPage = () => {
  // The authentication hook methods (II Auth Hook) are exposed through a React Context API called AuthContext.
  // These methods are utilized here with the help of the custom hook useAuth().
  const { ii } = useAuth();

  const onSubmit = async (data: { email: string; password: string }) => {
    // logic for login with email/password
  };

  const handleIILogin = () => {
    ii.login(onSuccess);

    async function onSuccess(hexPrincipal: string) {
      const identity = hexPrincipal;

      if (!is64CharHex(identity)) {
        return setErrorData(
          "Something went wrong! Could not login, please try again.",
        );
      }

      const res = await fetch("/user/loginWithII", { identity }, "POST");

      // handle response -> log in user or show error message.
    }
  };

  return (
    <div className="mx-auto w-full p-5 sm:max-w-md">
      <h2 className="mb-12 text-center text-4xl font-extrabold">DataPond</h2>

      {/* ...................... */}

      <button
        type="button"
        onClick={() => handleIILogin()}
        className="flex w-full items-center justify-center gap-4 rounded-md border border-gray-300 px-5 py-2 text-sm font-medium capitalize"
      >
        <Image
          src="/images/icp-logo-white.svg"
          alt="asd"
          width={40}
          height={24}
        />
        Sign In with Internet Identity
      </button>
    </div>
  );
};

export default Loginpage;
