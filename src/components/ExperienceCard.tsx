import { Experience } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

const ExperienceCard = (props: Experience) => {
  const { _id, name, location, image, description, price } = props;

  return (
    <div className="transform overflow-hidden rounded-xl bg-delite-background">
      <div className="relative h-[170px] w-full">
        <Image
          src={image}
          alt={name}
          fill={true}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="m-0 text-md font-medium text-delite-black">{name}</h3>
          <span className="whitespace-nowrap rounded-md text-xs font-medium bg-delite-tag px-2 py-1 text-gray-600">
            {location}
          </span>
        </div>

        <p className="mb-4 h-10 text-sm leading-normal text-delite-gray line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-normal text-delite-black">From</span>
                <span className="text-xl font-medium text-delite-black">₹{price}</span>
            </div>
            <Link href={`/experiences/${_id}`}>
              <button className="rounded-lg border-none bg-delite-yellow h-7.5 text-sm font-medium text-gray-800 transition-colors hover:bg-delite-yellow-dark w-25">
                  View Details
              </button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;