function getFollowButtonName(followStatus) {
        if (followStatus === "accepted") {
          return "Following";
        } else if (followStatus === "not-following") {
          return "Follow";
        } else if (followStatus === "pending") {
          return"Requested";
        }
    }
export default getFollowButtonName;