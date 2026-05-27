import SpotifyWebApi from "spotify-web-api-node";

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "No URL provided" });

  // extract playlist ID from URL
  const playlistId = url.split("/playlist/")[1]?.split("?")[0];
  if (!playlistId) return res.status(400).json({ error: "Invalid URL" });

  // get access token
  const auth = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(auth.body.access_token);

  // get playlist tracks
  const data = await spotify.getPlaylistTracks(playlistId);
  const songs = data.body.items.map(
    (item) => `${item.track.name} ${item.track.artists[0].name}`,
  );

  res.status(200).json({ songs });
}
