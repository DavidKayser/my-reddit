import React from 'react';
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectReddits, selectIsLoading, selectLoadMore, selectRedditFilter, loadReddits, resetReddits } from "./redditsSlice";
import "./Reddits.css";
import { useEffect, useState, useRef } from "react";
import { Loading } from "../../components/loading/Loading";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

const Reddits = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    let reddits = useSelector(selectReddits);
    const isLoading = useSelector(selectIsLoading);
    const loadMore = useSelector(selectLoadMore);
    const redditFilter = useSelector(selectRedditFilter);
    
    const [nextToLoad, setNextToLoad] = useState("");
    let { search } = useParams(null);
    let base;
    let tallestRefs = useRef([]);
    if (redditFilter !== null) {
        reddits = reddits.filter(reddit => reddit.flair === redditFilter);
    }

    useEffect(() => {
        console.log("load");
        dispatch(loadReddits({link: `/r/food.json?after=${nextToLoad}`, queryType: "full"}));
    }, [dispatch, nextToLoad]);

    useEffect(() => {
        if (search) {
            dispatch(resetReddits());
            dispatch(loadReddits({link: `/r/food/search.json?q=${search}&restrict_sr=1&sr_nsfw=`, queryType: "search"}));
        }
    }, [search, dispatch]);

    useEffect(() => {
        function watchScroll() {
            window.addEventListener("scroll", loadOnScroll);
        }
        watchScroll();
        return () => {
            window.removeEventListener("scroll", loadOnScroll);
        };
    });

    useEffect(() => {
        if (reddits.length < 9) {
            setNextToLoad(loadMore);
        }
    })

    //dispatch reddits
    function loadMoreReddits() {
        if (reddits[0] && !isLoading) {
            setNextToLoad(loadMore);
        }
    }

    // load more reddits when scrolling to bottom
    function loadOnScroll() {
        let maxHeight = 0;
        for (let i = 0; i < reddits.length; i++) {
            const { clientHeight } = tallestRefs.current[i];
            if (clientHeight > maxHeight) {
                 maxHeight = clientHeight;
            }
        }
        let scrollHeight, totalHeight;
        scrollHeight = document.body.scrollHeight;
        totalHeight = window.scrollY + window.innerHeight;
        if (totalHeight <= scrollHeight - maxHeight * 2) {
            base = false
        }
        if (totalHeight >= scrollHeight - maxHeight * 2) {
            if (base === true) return;
            loadMoreReddits();
            base = true
        } 
    }

    //set path for link
    function articleRoute(singleLink, id) {
        const seperateLink = singleLink.split("/");
        const title = seperateLink[seperateLink.length -2];
        return `/article/${id}/${title}` 
    }

    function placeHolderDimensions(width, height) {
        const ratio = height / width * 100;
        return {
            paddingTop: ratio + "%"
        }
    }

    return (
        <section className="main-content">
            <div id="reddits-previews">
            {reddits && (
                <ResponsiveMasonry
                    columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
                >
                    <Masonry>
                    {reddits.map((reddit, index) => (
                        <article className="reddits-article" key={index} ref={(element) => {tallestRefs.current[index] = element}}>
                            <div className="reddit-header">
                                <p className="float-left community">{reddit.subreddit}</p>
                                <p className="float-left">Posted by {reddit.author}</p>
                            </div>
                            <Link data-testid="single-link" to={articleRoute(reddit.singleLink, reddit.id)} state={{ backgroundLocation: location }}> 
                                <div className="reddits-body">  
                                    <h3 className="reddits-title">{reddit.title}</h3>
                                    <div className="image-wrapper" style={placeHolderDimensions(reddit.mediaDimensions.width, reddit.mediaDimensions.height)}>
                                        <img className="reddits-image" src={reddit.media} alt="media" />
                                    </div>
                                </div>
                            </Link>
                            {reddit.mediaType === "link" && (
                                <a href={reddit.media} target="_blank" rel="noreferrer">LINK</a>
                            )}
                            <div className="reddit-footer">
                                <p className="float-left">{reddit.upvotes} upvotes</p>
                                <p className="reddits-comments-icon float-left">{reddit.numberOfComments} Comments</p>
                                <p className="float-left">{reddit.postedOn}</p>
                            </div>
                        </article>
                    ))}
                    {isLoading && <Loading />}
                    {isLoading && <Loading />}
                    {isLoading && <Loading />}
                    </Masonry>
            </ResponsiveMasonry>
            )}
            </div>
        </section>
    );
}

export default Reddits;