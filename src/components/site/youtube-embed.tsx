export function YoutubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-black shadow-lg">
      <div className="relative aspect-video w-full">
        <iframe
          title={title ?? "Video de YouTube"}
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
