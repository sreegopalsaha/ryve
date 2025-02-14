import { useEffect, useState, useCallback } from "react";
import { Search, SearchX } from "lucide-react";
import Screen from "../components/molecules/Screen";
import Input from "../components/atoms/Input";
import UserCard from "../components/molecules/UserCard";
import NoDataFound from "../components/organisms/NoDataFound";
import { Loader2 } from "lucide-react";
import debounce from "lodash.debounce";
import { searchUsers } from "../services/ApiServices";
import GlobalError from "../components/errors/GlobalError";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuery = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm) {
        setResult([]);
        return;
      }
      setError(null);

      try {
        const res = await searchUsers(searchTerm);
        const users = res?.data?.data;
        setResult(users);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (!query) {
      setResult([]);
      return;
    }
    setSearching(true);
    fetchQuery(query);
  }, [query, fetchQuery]);

  return (
    <Screen middleScreen className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for users..."
          className="pl-10 pr-4 py-2 theme-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {searching ? (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin text-gray-600" size={24} />
        </div>
      ) : error ? (
        <GlobalError error={error} />
      ) : !query ? (
        <p>Search results will appear here</p>
      ) : result.length === 0 ? (
        <NoDataFound
          message="No user found, try a different search term."
          subMessage="Check the spelling and try again."
          icon={SearchX}
        />
      ) : (
        <div className="space-y-3">
          {result.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </Screen>
  );
};

export default SearchPage;
