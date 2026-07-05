import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosBase from '../../api/axiosConfig';
import classes from './Home.module.css';
import {
  FaUserCircle,
  FaChevronRight,
  FaSearch,
  FaTimes,
  FaPlus,
  FaEye,
  FaCheckCircle,
  FaRegCommentDots,
} from 'react-icons/fa';

const SkeletonCard = () => (
  <div className={classes.skeletonCard}>
    <div className={`${classes.skeletonCircle} ${classes.shimmer}`} />
    <div className={classes.skeletonLines}>
      <div className={`${classes.skeletonLine} ${classes.skeletonLineWide} ${classes.shimmer}`} />
      <div className={`${classes.skeletonLine} ${classes.skeletonLineNarrow} ${classes.shimmer}`} />
    </div>
  </div>
);

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unsolved', label: 'Unsolved' },
  { key: 'solved', label: 'Solved' },
];

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the signed-in user's profile only if a token exists
        if (token) {
          try {
            const userRes = await axiosBase.get('/users/profile');
            setUser(userRes.data.data);
          } catch (authErr) {
            console.warn('User auth context invalid or expired:', authErr);
          }
        }

        // Questions are public and always fetched
        const quesRes = await axiosBase.get('/questions');
        setQuestions(quesRes.data.questions || []);
      } catch (err) {
        console.error('Error fetching discussion board resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(
        (q) =>
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.userName && q.userName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .filter((q) => {
        if (activeFilter === 'solved') return !!q.is_solved;
        if (activeFilter === 'unsolved') return !q.is_solved;
        return true;
      });
  }, [questions, searchQuery, activeFilter]);

  const unsolvedCount = useMemo(
    () => questions.filter((q) => !q.is_solved).length,
    [questions]
  );

  const greetingName = user ? user.userName : 'Guest';

  return (
    <div className={classes.homeWrapper}>
      {/* Dashboard header */}
      <section className={classes.dashboardHeader}>
        <div className={classes.titleBlock}>
          <p className={classes.eyebrow}>Community dashboard</p>
          <h1 className={classes.mainHeading}>
            Welcome back, <span className={classes.userName}>{greetingName}</span>
          </h1>
          <p className={classes.subheading}>
            {unsolvedCount > 0
              ? `${unsolvedCount} question${unsolvedCount === 1 ? '' : 's'} still waiting for an answer.`
              : 'Browse open discussions or start one of your own.'}
          </p>
        </div>
        <Link to="/ask" className={classes.askBtn}>
          <FaPlus aria-hidden="true" />
          Ask Question
        </Link>
      </section>

      {/* Search */}
      <div className={classes.searchContainer}>
        <FaSearch className={classes.searchIcon} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search for an engineering question or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={classes.searchInput}
          aria-label="Search discussions"
        />
        {searchQuery && (
          <button
            type="button"
            className={classes.clearSearchBtn}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className={classes.filterRow} role="tablist" aria-label="Filter by status">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.key}
            className={`${classes.filterPill} ${
              activeFilter === filter.key ? classes.filterPillActive : ''
            }`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Section divider with live count */}
      <div className={classes.sectionLabelDivider}>
        <span className={classes.sectionLabel}>Recent Activity Discussions</span>
        {!loading && (
          <span className={classes.countPill}>
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
          </span>
        )}
        <div className={classes.line} />
      </div>

      {/* List */}
      {loading ? (
        <div className={classes.listContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className={classes.listContainer}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q) => {
              const isOwnQuestion =
                user && (user.user_id === q.user_id || user.userName === q.userName);

              return (
                <Link
                  to={`/question/${q.question_id}`}
                  key={q.question_id}
                  className={`${classes.questionCard} ${
                    isOwnQuestion ? classes.ownQuestionCard : ''
                  } ${q.is_solved ? classes.solvedQuestionCard : ''}`}
                >
                  <div className={classes.cardLeftSection}>
                    <div className={classes.avatarWrapper}>
                      {q.profile_image ? (
                        <img
                          src={q.profile_image}
                          alt=""
                          className={classes.userAvatarImg}
                        />
                      ) : (
                        <FaUserCircle size={40} className={classes.defaultIconAvatar} />
                      )}
                    </div>
                    <div className={classes.metaDetails}>
                      <div className={classes.titleInlineGroup}>
                        {q.is_solved ? (
                          <span className={classes.solvedBadge}>
                            <FaCheckCircle aria-hidden="true" /> Solved
                          </span>
                        ) : (
                          <span className={classes.openBadge}>Open</span>
                        )}
                        <h3 className={classes.qTitle}>{q.title}</h3>
                        {isOwnQuestion && (
                          <span className={classes.userOwnerBadge}>You Asked</span>
                        )}
                      </div>
                      <span className={classes.authorStamp}>
                        Asked by{' '}
                        <strong className={classes.authorHighlight}>
                          {isOwnQuestion ? 'You' : q.userName}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className={classes.cardRightSection}>
                    <div className={classes.statGroup}>
                      <span className={classes.statItem} title="Answers">
                        <FaRegCommentDots aria-hidden="true" />
                        {q.answer_count ?? 0}
                      </span>
                      <span className={classes.statItem} title="Views">
                        <FaEye aria-hidden="true" />
                        {q.views ?? 0}
                      </span>
                    </div>
                    <div className={classes.arrowIconWrapper}>
                      <FaChevronRight className={classes.actionChevron} aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className={classes.noDataCard}>
              <h3>No results found</h3>
              <p>
                {searchQuery
                  ? "We couldn't find matches for your search. Double-check your spelling or look up another topic."
                  : activeFilter !== 'all'
                  ? `There are no ${activeFilter} questions right now.`
                  : 'The forum database queue is currently empty.'}
              </p>
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  type="button"
                  className={classes.resetSearchBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;