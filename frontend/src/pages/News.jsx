import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import api from "../api";
import "../styles/news.css";
import photo from "./News/jhon.jpg";
import "swiper/css";
import { Link } from "react-router-dom";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";

const News = () => {
  const [news, setNews] = useState([]);
  const [savedNewsIds, setSavedNewsIds] = useState([]); // Track saved news IDs
  const navigate = useNavigate(); // Navigation between pages

  useEffect(() => {
    // Fetch all news
    api
      .get("https://data.cityofchicago.org/resource/ijzp-q8t2.json?$query=SELECT%0A%20%20%60id%60%2C%0A%20%20%60case_number%60%2C%0A%20%20%60date%60%2C%0A%20%20%60block%60%2C%0A%20%20%60iucr%60%2C%0A%20%20%60primary_type%60%2C%0A%20%20%60description%60%2C%0A%20%20%60location_description%60%2C%0A%20%20%60arrest%60%2C%0A%20%20%60domestic%60%2C%0A%20%20%60beat%60%2C%0A%20%20%60district%60%2C%0A%20%20%60ward%60%2C%0A%20%20%60community_area%60%2C%0A%20%20%60fbi_code%60%2C%0A%20%20%60x_coordinate%60%2C%0A%20%20%60y_coordinate%60%2C%0A%20%20%60year%60%2C%0A%20%20%60updated_on%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60location%60%0AWHERE%20%60date%60%20%3E%3D%20%222016-01-01T00%3A00%3A00%22%20%3A%3A%20floating_timestamp%0AORDER%20BY%20%60date%60%20DESC%20NULL%20FIRST")
      .then((response) => {
        setNews(response.data); // Set the news data
      })
      .catch((error) => {
        console.error("Error fetching the news:", error);
      });

    // Fetch saved news
    api
      .get("/api/saved-news/")
      .then((response) => {
        const savedIds = response.data.saved_news.map(
          (newsItem) => newsItem.id
        ); // Access saved_news array
        setSavedNewsIds(savedIds); // Store saved news IDs
      })
      .catch((error) => {
        console.error("Error fetching saved news:", error);
      });
  }, []);

  // Toggle save or unsave news
  const toggleSaveNews = async (newsId) => {
    try {
      const response = await api.post(`/api/save-news/${newsId}/`);
      const message = response.data.message;
      if (message.includes("removed")) {
        // Unsave news
        setSavedNewsIds((prevSavedNewsIds) =>
          prevSavedNewsIds.filter((id) => id !== newsId)
        );
      } else {
        // Save news
        setSavedNewsIds((prevSavedNewsIds) => [...prevSavedNewsIds, newsId]);
      }
    } catch (error) {
      console.error("Error saving/unsaving news:", error);
    }
  };
  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };
  return (
    <div id="News">
      <Nav />
      <div className="news-container">
        <button onClick={() => navigate("/saved-news")}>View Saved News</button>
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={3}
          coverflowEffect={{
            rotate: 2,
            stretch: 0,
            depth: 100,
            modifier: 5,
          }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="swiper_container"
        >
          {news.map((item) => (
            <SwiperSlide id={item.id} key={item.id}>
              <div className="card">
                <Link to={`/news/${item.id}`}>
                  <h2 className="note-title">Title: {item.title}</h2>
                  <h2 className="note-title">
                    Date: {new Date(item.created).toLocaleDateString()}
                  </h2>
                  <img className="news-image" src={photo} alt={item.title} />
                  <div className="card-p">
                    <p>
                      {truncateText(
                        `Description: ${item.description || "No description available"}\nLocation: ${item.location_description || "Unknown"}\nArrest: ${item.arrest ? "Yes" : "No"}\nPrimary Type: ${item.primary_type || "N/A"}\nCommunity Area: ${item.community_area || "N/A"}`,
                        40
                      )}
                    </p>
                  </div>
                </Link>
                <button
                  className="card-but"
                  onClick={() => toggleSaveNews(item.id)}
                  style={{
                    backgroundColor: savedNewsIds.includes(item.id)
                      ? "green"
                      : "blue",
                    color: "white",
                  }}
                >
                  {savedNewsIds.includes(item.id) ? "Unsave" : "Save"}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Footer />
    </div>
  );
};

export default News;
