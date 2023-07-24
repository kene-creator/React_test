// AdminDashboardPage.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router-dom";
import MkdSDK from "../utils/MkdSDK";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import arrowIcon from "../assets/icons.png";
import image from "../assets/XSmall.png";

const VideoItem = ({ video, index, moveVideo }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: "video",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveVideo(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: "video",
    item: { id: video.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="flex gap-4 items-center px-4 py-6 border border-zinc-400 rounded-2xl justify-between w-full"
    >
      <p style={{ flex: "0 0 2%" }}>{video.id}</p>
      <div
        className="flex items-center justify-center basis[30%] gap-4"
        style={{ flex: "0 0 45%" }}
      >
        <img
          src={video.photo}
          alt={video.title}
          className="w-[6rem] h-[3rem] rounded-xl"
        />

        <p>{video.title}</p>
      </div>
      <div
        className="flex items-center justify-center gap-1"
        style={{ flex: "0 0 30%" }}
      >
        <img src={image} alt="Author icon" />
        <p>Username: {video.username}</p>
      </div>
      <div
        className="flex items-center justify-center"
        style={{ flex: "0 0 20%" }}
      >
        <img src={arrowIcon} alt="arrow icon" />
        <p>225</p>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/admin/login");
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  const fetchVideos = async () => {
    try {
      const sdk = new MkdSDK();
      const response = await sdk.callRestAPI(
        { page: page, limit: 10 },
        "PAGINATE"
      );
      setVideos(response.list);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const moveVideo = (dragIndex, hoverIndex) => {
    const draggedVideo = videos[dragIndex];
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      newVideos.splice(dragIndex, 1);
      newVideos.splice(hoverIndex, 0, draggedVideo);
      return newVideos;
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchVideos();
  }, [page]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full flex items-center text-white bg-black px-16 py-16 flex-col min-h-full">
        <div className="flex justify-between w-full">
          <h2 className="font-bold text-xl">APP</h2>
          <button
            className="bg-[#9BFF00] px-4 py-2 rounded-xl text-black"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <div className="mt-12 flex justify-between w-full">
          <h1 className="text-4xl">Todays Leaderboard</h1>
          <div
            className="rounded-lg bg-gray-700 p-4 flex gap-3"
            style={{ minWidth: "150px" }}
          >
            <p className="text-white font-bold">{formattedDate}</p>
            <p className="text-white">{formattedTime}</p>
          </div>
        </div>
        <div className="flex justify-between w-full mt-6">
          <p>
            # <span>Title</span>
          </p>
          <p>Author</p>
          <p>Most Liked</p>
        </div>
        <div className="w-full flex items-center text-white h-screen bg-black py-16 flex-col">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex gap-6 flex-col h-[90%] overflow-scroll w-full">
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <VideoItem
                    key={video.id}
                    video={video}
                    index={index}
                    moveVideo={moveVideo}
                  />
                ))
              ) : (
                <p>No videos found</p>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-center mt-[-5rem]">
          <button
            className="bg-[#9BFF00] px-4 py-2 rounded-xl text-black"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className="bg-[#9BFF00] px-4 py-2 rounded-xl text-black ml-4"
            onClick={handleNextPage}
            disabled={videos.length === 0}
          >
            Next
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default AdminDashboardPage;
