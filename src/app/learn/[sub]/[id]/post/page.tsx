"use client";

import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getMe } from "@/libs/me";
import { Course, CourseStatus, CSVRecord } from "../../../../../../interface";
import { getExamfile } from "@/libs/getfile";
import Link from "next/link";
import Image from "next/image";
import { DriveURL } from "@/libs/driveURL";

export default function PostTestPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [courseStatus, setCourseStatus] = useState<CourseStatus | null>(null);
  const [exam, setExam] = useState<Array<CSVRecord>>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();

  let sub = "";
  if (typeof window !== "undefined") {
    const urlParts = window.location.href.split("/");
    sub = urlParts.length > 4 ? decodeURIComponent(urlParts[4]) : "";
  }
  const Sub = sub;

  let subIndex = 0;
  if (Sub.match("Human geography")) subIndex = 0;
  if (Sub.match("Physical geography")) subIndex = 1;
  if (Sub.match("Geography Techniques")) subIndex = 2;

  useEffect(() => {
    const token = session?.user.token;

    const fetchCourseData = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/course/${params.id}`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          Swal.fire({
            title: "Fetch Failed",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/";
          });
          return;
        }

        const data = await response.json();
        setCourse(data.data);
      } catch (error) {
        Swal.fire({
          title: "Fetch Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/";
        });
      }
    };

    const fetchCourseStatus = async () => {
      try {
        if (token) {
          const status = (await getMe(token)) as CourseStatus;
          setCourseStatus(status);
        }
      } catch (error) {
        Swal.fire({
          title: "Fetch Status Failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/";
        });
      }
    };

    if (token) {
      fetchCourseData();
      fetchCourseStatus();
    }
  }, [session, params.id]);

  useEffect(() => {
    if (course && courseStatus) {
      const chapterUser = parseInt(courseStatus.chapter[subIndex] as string);
      const currentUser = (courseStatus.current[subIndex] as string) ?? "";
      const chapterNow = parseInt(course.chapter as string);

      if (!isNaN(chapterUser) && !isNaN(chapterNow)) {
        if (chapterNow !== chapterUser || !currentUser.match("post")) {
          Swal.fire({
            title: "Cannot go to this route",
            text: "Go to main",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/";
          });
        }
      }

      const cs = course.subject as string;
      const ss = course.subsubject as string;
      const un = course.unit as string;
      const cc = course.chapter as string;
      const fileName = `${cs}_${ss}_${un}_${cc}.csv`;
      getExamfile(fileName).then((res: Array<CSVRecord>) => setExam(res));
    }
  }, [course, courseStatus]);

  const handleChange = (index: number, value: string) => {
    setAnswers({
      ...answers,
      [index]: value,
    });
  };

  const saveAnswer = async (data: string) => {
    try {
      await fetch("/api/file/saveData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: data }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = async () => {
    if (courseStatus) {
      if (courseStatus?.chapter && courseStatus.chapter[subIndex]) {
        let currentChapter = parseInt(courseStatus.chapter[subIndex]) || 0;
        currentChapter += 1;
        courseStatus.chapter[subIndex] = currentChapter.toString();
      }

      if (courseStatus?.current) {
        courseStatus.current[subIndex] = "pre";
      }

      const updatedStatus = {
        ...courseStatus,
        chapter: courseStatus.chapter,
        current: courseStatus.current,
      };

      const token = session?.user.token;
      const id = session?.user._id;

      await fetch(`/api/updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          course: [updatedStatus],
          id: id,
        }),
      });
    }
  };

  const handleSubmit = () => {
    const unansweredQuestions = exam.some((_, index) => !answers[index]);

    if (unansweredQuestions) {
      Swal.fire({
        title: "Incomplete Test",
        text: "Please answer all questions before submitting.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setSubmitted(true);

    let score = 0;
    let data: string = "";

    const saveDate = Date.now();
    const date = new Date(saveDate);
    const email = session?.user.email ?? "";

    exam.forEach((question, index) => {
      const answerData = [
        date,
        course?.subject,
        course?.subsubject,
        course?.unit,
        `${course?.chapter} Post`,
        question.question,
        question.answer,
        email,
        answers[index],
      ].join(",");
      data += `\n${answerData}`;

      if (answers[index] === question.answer) {
        score += 1;
      }
    });

    Swal.fire({
      title: "Test Completed",
      text: `You scored ${score} out of ${exam.length}`,
      icon: "success",
      confirmButtonText: "OK",
    }).then(async () => {
      await saveAnswer(data);
      await updateUser();
    });
  };

  return (
    <main className="flex flex-col items-center min-h-[100vh] p-3 overflow-hidden bg-slate-200">
      <h1 className="text-3xl font-semibold mb-6 mt-5">Post-Test</h1>
      <small className="-mt-5 mb-6 text-lg">
        {course?.subsubject + ", " + course?.chapter}
      </small>
      <div
        className="z-10 px-7 py-5 shadow border border-gray-300 space-y-10 bg-white rounded-xl 
        flex flex-col w-full md:w-4/5 lg:w-4/5 xl:w-3/6"
        style={{ boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px" }}
      >
        <div className="flex flex-col items-center -mb-4">
          <h1 className="text-3xl font-bold">EarthEd</h1>
          <small className="text-red-500 font-bold">
            Exploring the world, One lesson at a time
          </small>
          <hr className="w-4/5 h-1 bg-black mt-2 rounded-xl" />
          <div className="w-full">
            {exam.length > 0 ? (
              exam.map((question, index) => (
                <div
                  key={index}
                  className="my-4 p-4 border rounded-md bg-gray-100"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {index + 1}. {question.question}{" "}
                    {question.image ? (
                      <Link
                        href={question.image}
                        className="font-normal text-md text-orange"
                      >
                        Image
                      </Link>
                    ) : (
                      ""
                    )}
                  </h2>
                  {question.image && (
                    <div className="w-full sm:w-1/2 relative p-24 my-3">
                      <Image
                        style={{ borderRadius: "9px" }}
                        src={DriveURL(question.image)}
                        fill={true}
                        objectFit="cover"
                        alt={question.question}
                      ></Image>
                    </div>
                  )}
                  <div className="space-y-2">
                    {[question.q1, question.q2, question.q3, question.q4].map(
                      (option, idx) => (
                        <label key={idx} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            onChange={() => handleChange(index, option)}
                            className="mr-2"
                            disabled={submitted}
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                  {submitted && (
                    <div className="mt-4 p-2 bg-gray-200 rounded-md">
                      <p className="text-green-600">
                        <strong>Answer:</strong> {question.answer}
                      </p>
                      <p className="text-gray-600">
                        <strong>Reason:</strong> {question.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center font-semibold text-red-600 bg-red-100 p-4 rounded-md mt-3 mb-3">
                No exam questions available at this moment. Please check back
                later.
              </p>
            )}
            {exam.length > 0 && !submitted && (
              <div className="-mt-2 mb-2 flex flex-col items-center">
                <button
                  onClick={handleSubmit}
                  className="mt-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700
                  w-full sm:w-3/5"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
