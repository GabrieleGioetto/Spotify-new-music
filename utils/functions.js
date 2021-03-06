//Eliminate duplicate albums
export function getUniqueListBy(arr, key) {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}

// Remove not explicit version if both versions are available
export function getOnlyExplicitVersion(tracks) {
  const explicit_tracks = tracks.filter((t) => t["explicit"]);
  console.log(explicit_tracks);
  const explicit_nameSong_artist = explicit_tracks.map(
    (t) => `${t["name"]}|${t["artists"][0]["id"]}`
  );

  console.log(explicit_nameSong_artist);

  // I keep a song only if it's either explicit or if there isn't an explicit version
  const filtered = tracks.filter(
    (t) =>
      t.explicit ||
      !explicit_nameSong_artist.includes(
        `${t["name"]}|${t["artists"][0]["id"]}`
      )
  );

  return filtered;
}

export function getLastWeekDate() {
  const now = new Date();
  // filterDate.setMonth(filterDate.getMonth() - 1);
  const filterDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );

  console.log(
    filterDate.toLocaleDateString("en-GB").split("/").reverse().join("-")
  );
  // get date format YYYY-MM-DD from DD/MM/YYYY

  return filterDate.toLocaleDateString("en-GB").split("/").reverse().join("-");
}
