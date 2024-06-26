"use client";

import Image from "next/image";
import { DriveURL } from "@/libs/driveURL";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

export default function CourseCard({
  id,
  subject,
  title,
  chapter,
  description,
  image,
  current,
  sub,
}: {
  id: string;
  subject: string;
  title: string;
  chapter: string;
  description: string;
  image: string;
  current: string;
  sub: string;
}) {
  const { data: session } = useSession();
  const role = session?.user.role;

  const del = async () => {
    Swal.fire({
      title: "Delete Chapter",
      text: "Do you want to delete it?",
      confirmButtonText: "Yes, I do",
      cancelButtonText: "No!",
      showCancelButton: true,
      icon: "question",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const token = session?.user.token;
        try {
          const response = await fetch("/api/course/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id,
              token,
            }),
          });

          if (response.ok) {
            Swal.fire({
              title: "Delete Successful",
              text: "Delete chapter",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              window.location.href = "/learn";
            });
          } else {
            Swal.fire({
              title: "Fail to delete",
              text: "Something went wrong",
              timer: 2000,
              icon: "error",
              showConfirmButton: false,
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Fail to delete",
            text: "Something went wrong",
            timer: 2000,
            icon: "error",
            showConfirmButton: false,
          });
        }
      }
    });
  };

  return (
    <div className="shadow border border-gray-300 bg-white rounded-xl w-full p-5">
      <div className="w-full relative p-24">
        <Image
          style={{ borderRadius: "9px" }}
          src={DriveURL(image)}
          fill={true}
          objectFit="cover"
          alt={subject + " " + chapter}
        ></Image>
      </div>
      <div className="m-3 gap-y-2 flex flex-col items-start">
        <div className="inline-flex items-baseline gap-x-2">
          <h1 className="text-lg font-semibold">Title: </h1>
          <h1 className="text-lg">{title}</h1>
        </div>
        <div className="inline-flex items-baseline gap-x-2">
          <h1 className="text-lg font-semibold">Chapter: </h1>
          <h1 className="text-lg">{chapter}</h1>
        </div>
        <div className="inline-flex items-baseline gap-x-2">
          <h1 className="text-lg">{description}</h1>
        </div>
        {role === "user" ? (
          current.includes("pre") ? (
            <Link
              href={`/learn/${sub}/${id}/pre`}
              className="w-full bg-amber-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-amber-600 active:scale-75 transition-all"
            >
              Pre-Test
            </Link>
          ) : current.includes("learn") ? (
            <Link
              href={`/learn/${sub}/${id}`}
              className="w-full bg-emerald-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-emerald-600 active:scale-75 transition-all"
            >
              Learn
            </Link>
          ) : current.includes("post") ? (
            <Link
              href={`/learn/${sub}/${id}/post`}
              className="w-full bg-rose-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-rose-600 active:scale-75 transition-all"
            >
              Post-Test
            </Link>
          ) : current.includes("review") ? (
            <Link
              href={`/learn/${sub}/${id}`}
              className="w-full bg-blue-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-blue-600 active:scale-75 transition-all"
            >
              Review
            </Link>
          ) : (
            <div
              className="w-full bg-red-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-red-600 active:scale-75 transition-all cursor-not-allowed"
            >
              Lock
            </div>
          )
        ) : (
          <>
            <Link
              href={`/learn/${sub}/${id}`}
              className="w-full bg-emerald-500 p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-emerald-600 active:scale-75 transition-all"
            >
              View
            </Link>
            <Link
              href={`/learn/${sub}/${id}/edit`}
              className="w-full bg-orange p-2 rounded-xl mt-1 text-center 
            text-white hover:bg-orangeHover active:scale-75 transition-all"
            >
              Update
            </Link>
            <button
              className="bg-red-500 text-white p-2 rounded-xl w-full mt-1
              active:scale-75 transition-all hover:bg-red-600"
              onClick={del}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
