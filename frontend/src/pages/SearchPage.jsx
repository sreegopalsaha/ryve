import { useEffect, useState, useMemo } from "react";
import { Search, SearchX, Users, X } from "lucide-react";
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

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm) => {
        if (!searchTerm.trim()) {
          setResult([]);
          setSearching(false);
          return;
        }
        setError(null);

        try {
          const res = await searchUsers(searchTerm.trim());
          const users = res?.data?.data || [];
          setResult(users);
        } catch (err) {
          console.error("Search error:", err);
          setError(err);
        } finally {
          setSearching(false);
        }
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!query.trim()) {
      setResult([]);
      setSearching(false);
      debouncedSearch.cancel();
      return;
    }
    setSearching(true);
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <Screen middleScreen className="gap-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        {/* Search Input Container */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for people by name or username..."
            className="pl-11 pr-10 py-2.5 theme-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Area */}
        {searching ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : error ? (
          <GlobalError error={error} />
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500 gap-2">
            <Users size={48} className="opacity-20" />
            <p className="text-sm">Type a name or username above to find people on Ryve.</p>
          </div>
        ) : result.length === 0 ? (
          <NoDataFound
            message="No users found"
            subMessage={`No accounts matching "${query}". Check the spelling and try again.`}
            icon={SearchX}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {result.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
};

export default SearchPage;
