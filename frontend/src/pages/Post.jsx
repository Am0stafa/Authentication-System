import { useLocation } from "react-router";
import { posts } from "../data";

const Post = () => {
    const location = useLocation();
    const id = location.pathname.split("/")[2];
    const post = posts.filter(post =>  post.id.toString() === id)
    console.log(post)
  return (
    <div className="post">
      <img src={post[0].img} alt="" className="postImg" />
      <h1 className="postTitle">{post[0].title}</h1>
      <p className="postDesc">{post[0].desc}</p>
      <p className="postLongDesc">{post[0].longDesc}</p>
    </div>
  )
}

export default Post