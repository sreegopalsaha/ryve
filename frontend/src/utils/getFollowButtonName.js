function getFollowButtonName(followStatus) {
  if (followStatus === "accepted") {
    return "Following";
  } else if (followStatus === "pending") {
    return "Requested";
  }
  return "Follow";
}

export default getFollowButtonName;
