import Link from "next/link";
import ProfilePicture from "./ProfilePicture";
import { useCallback, useState } from "react";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { HeartFilled, HeartOutlined, MessageOutlined } from "@ant-design/icons";
import { DbConnector } from "@/logic/DbConnector";


export default function PostList({ posts }) {
    const [user, _] = useState(JSON.parse(localStorage.getItem('user')));

    return (
        <ul>
            {posts.map((post, index) => <Post post={post} user={user} key={index}/>)}
        </ul>
    );
}

/*{
    posterId,
    posterName,
    posterAvatarColor,
    likes,
    didUserLike,
    when,
    postId,
    commentNumber,
    text
}*/
function Post({ post, user }) {
    const [userLiked, setUserLiked] = useState(post.didUserLike);
    const [likes, setLikes] = useState(post.likes);

    const onClickPost = useCallback(() => {
        redirect(`/post/${post.postId}`);
    }, [post]);

    const onClickLike = useCallback((e) => {
        async function like() {
            const nowLikes = !userLiked;
            if (nowLikes) {
                await DbConnector.getInstance().likePost(user.id, post.postId, false);
                setLikes(likes + 1);
            }
            else {
                await DbConnector.getInstance().dislikePost(user.id, post.postId, false);
                setLikes(likes - 1);
            }
            
            setUserLiked(nowLikes);
        }
        e.stopPropagation();
        like();
    }, [userLiked, likes, user, post]);

    return (
        <li>
            <div 
                className="button-panel border-b border-secondary flex flex-row p-4 gap-4"
                onClick={onClickPost}
            >
                <Link href={`/profile/${post.posterId}`} className="h-fit">
                    <ProfilePicture size={48} color={post.posterAvatarColor}/>
                </Link>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-row gap-4">
                        <Link href={`/profile/${post.posterId}`} className="font-bold">
                            {post.posterName}
                        </Link>
                        <span className="text-secondary">{dayjs(post.when).format('HH:mm • DD/MM/YYYY')}</span>
                    </div>
                    <span>{post.text}</span>
                    <div className="flex justify-around">
                        <div className="flex items-center gap-2">
                            {(userLiked) ? 
                                <HeartFilled style={{ fontSize: 24, color: '#9c86b1' }} onClick={onClickLike}/> 
                            :
                                <HeartOutlined style={{ fontSize: 24, color: '#9c86b1' }} onClick={onClickLike}/> 
                            }
                            <span className="text-secondary">{likes}</span> 
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageOutlined style={{ fontSize: 24, color: '#9c86b1' }}/>
                            <span className="text-secondary">{post.commentNumber}</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </li>
    );
}