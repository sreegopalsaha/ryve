import Screen from "../components/molecules/Screen";
import UserSuggestions from "../components/organisms/UserSuggestions";

function RightSidebar() {
  return (
    <Screen className="hidden md:flex w-[30%] fixed top-0 right-0 h-full p-4">
      <div className="w-full max-w-sm mx-auto">
        <UserSuggestions />
      </div>
    </Screen>
  );
}

export default RightSidebar;
