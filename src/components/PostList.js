import Link from "next/link";
import ProfilePicture from "./ProfilePicture";


export default function PostList({ posts }) {
    return (
        <ul>
            {posts.map(p => <Post post={p}/>)}
        </ul>
    );
}

/*{
    posterId,
    posterName,
    posterAvatarColor,
    likes,
    when,
    postId,
    text
}*/
function Post({ post }) {
    return (
        <li key={post.postId}>
            <Link 
                href={`/post/${post.postId}`}
                className="button-panel border-b border-secondary flex flex-row p-4 gap-4"
            >
                <ProfilePicture size={48} color={post.posterAvatarColor}/>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <span>{post.posterName}</span>
                        <span>{post.when.toString()}</span>
                    </div>
                    <span>{post.text}</span>
                    <div>{post.likes}</div>
                </div>
            </Link>
            
        </li>
    );
}