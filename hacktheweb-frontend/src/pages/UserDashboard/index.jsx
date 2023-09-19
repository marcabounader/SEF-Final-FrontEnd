import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Circle from '../../components/Objects/circle';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import SideButton from '../../components/Sidebar/SideButton';
import Achievements from '../../components/Content/Achievements';
import Labs from '../../components/Content/Labs';
import ActiveLabs from '../../components/Content/ActiveLabs';
import CompletedLabs from '../../components/Content/CompletedLabs';
import Home from '../../components/Content/Home';
import './UserDashboard.css';
import { faFlaskVial, faHome, faMedal, faRunning, faVialCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { setLabs, setBadges, setStatistics } from '../../slices/labSlice'; 
import { getLabs, getStatistics, getUserBadges } from '../../helpers/user.helpers';
import Leaderboard from '../../components/Content/Leaderboard';
import ChatBotModal from '../../components/Modals/ChatBot/ChatBotModal';

const UserDashboard = ({onLeave,onEnter,addCircleRef,areCirclesVisible,state,toggleContent}) => {
  const dispatch = useDispatch();
  const completedLabs = useSelector((state) => state.labs.completedLabs);
    const user = useSelector((state) => state.user);
    const { token } = user;
    const navigate=useNavigate();
    const [isMounted, setIsMounted] = useState(false);
    const [showBot,setShowBot]=useState(false);
    const handleOpenBot = () => setShowBot(true);
    const handleCloseBot =() => setShowBot(false);
    const [currentPage,setCurrentPage]=useState(1);
    const [totalPages,setTotalPages]=useState(1);
    const [perPage,setPerPage]=useState(9);
    const [totalLabs,setTotalLabs] = useState('');
    const [badgesPerPage,setBadgesPerPage]=useState(5);
    const [totalBadges,setTotalBadges] = useState('');

    useEffect(() => {
      setIsMounted(true);
      toggleContent('home');
      if (!token) {
        navigate('/');
      }
    }, []);
    const fetchLabs = async () => {
      try {
        const { data, message, errorMessages } = await getLabs(token,currentPage);
        if (message && message === "Unauthenticated.") {
          navigate("/");
        } else if (data && data.labs) {
          dispatch(setLabs(data.labs.data));
          setTotalPages(data.labs.last_page);
          setPerPage(data.labs.per_page);
          setTotalLabs(data.labs.total);
        }
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };

    useEffect(() => {
      if (isMounted) {
        const fetchStatistics = async () => {
          try {
            const { data, message, errorMessages } = await getStatistics(token);
            if (message && message === "Unauthenticated.") {
              navigate("/");
            } else if (data && data.message) {
              const { message, ...statistics_temp } = data;
              dispatch(setStatistics(statistics_temp));
            }
          } catch (error) {
            console.error("Error fetching statistics:", error);
          }
        };
        fetchStatistics();
      }
    }, [completedLabs, isMounted]);

    const fetchBadges = async () => {
      try {
        const { data, message, errorMessages } = await getUserBadges(token);
        if (message && message === "Unauthenticated.") {
          navigate("/");
        } else if (data && data.badges) {
          dispatch(setBadges(data.badges.data)); 
          setTotalPages(data.badges.last_page);
          setBadgesPerPage(data.badges.per_page);
          setTotalBadges(data.badges.total); 
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };
    

    const circles = [];

    if (areCirclesVisible) {
      circles.push(<Circle size="sm" ref={addCircleRef} delay={0} key="circle-sm" />);
      circles.push(<Circle size="md" ref={addCircleRef} delay={0.1} key="circle-md" />);
      circles.push(<Circle size="lg" ref={addCircleRef} delay={0.2} key="circle-lg" />);
    }
    const {  home,achievements,labs_tab, active_tab, completed_tab,leaderboard} = state;

    return ( 
        <section className='main-wrapper'>
            {circles}
            <Sidebar>
                <SideButton 
                icon={faHome}
                onEnter={onEnter} 
                onLeave={onLeave}
                icon_style="text-color-main"
                text="Home"
                onClick={() => {
                  toggleContent("home");
                }}
                className={`transition-all ${home && " text-black bg-bg-active"}`}
                />
                <SideButton 
                text="Achievements"
                icon={faMedal}
                onEnter={onEnter} 
                onLeave={onLeave}
                icon_style="text-color-secondary"
                onClick={() => {
                  toggleContent("achievements");
                }}
                className={`transition-all ${achievements && "text-black bg-bg-active"}`}
                />
                <SideButton 
                text="Labs"
                icon={faFlaskVial}
                onEnter={onEnter} 
                onLeave={onLeave}
                icon_style="text-color-secondary"
                onClick={() => {
                  toggleContent("labs_tab");
                }}
                className={`transition-all ${labs_tab && "text-black bg-bg-active"}`}
                />
                <SideButton 
                text="Active"
                icon={faRunning}
                onEnter={onEnter} 
                onLeave={onLeave}
                icon_style="text-color-secondary"
                onClick={() => {
                  toggleContent("active_tab");
                }}
                className={`transition-all ${active_tab && "text-black bg-bg-active"}`}
                />
                <SideButton 
                text="Completed Labs"
                icon={faVialCircleCheck}
                onEnter={onEnter} 
                onLeave={onLeave}
                icon_style="text-color-secondary"
                onClick={() => {
                  toggleContent("completed_tab");
                }}
                className={`transition-all ${completed_tab && "text-black bg-bg-active"}`}
                />
            </Sidebar>
            <div className='content-wrapper'>
                {home && <Home/>}
                {achievements && <Achievements/>}
                {labs_tab && <Labs labs_tab={labs_tab} fetchLabs={fetchLabs} totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>}
                {active_tab && <ActiveLabs/>}
                {completed_tab && <CompletedLabs/>}
                {leaderboard && <Leaderboard/>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 100 100"
                  width="75px"
                  height="75px"
                  className="fixed bottom-2 right-2"
                  onClick={handleOpenBot}
                >
                  <g>
                    <path fill="#55ABE0" d="M73.142 40.869c0-.084.003-.166.003-.25 0-14.843-6.384-26.875-14.259-26.875-2.438 0-4.733 1.156-6.739 3.191a2.997 2.997 0 0 1-4.294 0c-2.007-2.035-4.301-3.191-6.739-3.191-7.875 0-14.26 12.032-14.26 26.875 0 .084.003.166.003.25C15.209 43.914 7.5 49.186 7.5 55.185c0 9.429 19.028 14.476 42.5 14.476s42.5-5.047 42.5-14.476c0-5.999-7.709-11.271-19.358-14.316z" />
                    <path fill="#55ABE0" d="M17.849 71.963l3.061 11.073a2.556 2.556 0 0 0 2.48 1.942l13.756 1.223c.734.065 1.474.086 2.204-.012 2.211-.295 4.286-1.32 5.763-3.013 1.443-1.654 3.109-2.6 4.886-2.6 1.776 0 3.442.946 4.886 2.6 1.477 1.692 3.553 2.718 5.763 3.013.73.097 1.471.077 2.204.012l13.756-1.223a2.554 2.554 0 0 0 2.48-1.942l3.061-11.073a2.555 2.555 0 0 0-2.48-3.169c-19.78 4.054-39.56 4.054-59.341 0a2.556 2.556 0 0 0-2.479 3.169z" />
                  </g>
                </svg>
                <ChatBotModal isOpen={showBot} handleCloseViewModal={handleCloseBot}/>
            </div>
        </section>
        
    );
}
 
export default UserDashboard;