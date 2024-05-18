import Image from "next/image";

export default function ImageSlider({ images }: { images: string[] }) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-[720px] relative">
        <div className="w-full flex flex-row overflow-x-auto snap-x snap-mandatory">
          {images.map((url, index) => (
            <div
              key={index}
              className="w-full h-[280px] relative m-1 flex-shrink-0 snap-start"
            >
              <Image
                src={url}
                alt={`Image ${index}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
