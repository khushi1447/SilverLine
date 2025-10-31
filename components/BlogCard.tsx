import Image from "next/image"
import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  date: string
  category: string
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in">
      <Link href={`/blog/${post.id}`}>
        <div className="relative overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(post.date)}</span>
        </div>

        <Link href={`/blog/${post.id}`}>
          <h2 className="font-bold text-xl text-gray-900 mb-3 hover:text-gray-700 transition-colors">{post.title}</h2>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center space-x-2 text-gray-900 font-medium hover:text-gray-700 transition-colors"
        >
          <span>Read More</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
