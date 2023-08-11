const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {

  const total = (sum,ele) => {
    return sum + ele?.likes
  }

  return blogs.lenth === 0 ? 0 :
    blogs.reduce(total,0)
}

const favoriteBlog = (blogs) => {
  const shearchFavorite = (fav, crr) => {
    return (fav.likes >= crr.likes) ? fav : crr
  }
  return blogs.lenth === 0 ? {} : blogs.reduce(shearchFavorite,{})
}

const mostBlogs = (blogs) => {
  const groupBlog = blogs.map( (blog,i,blogs) => {

    let sum = 0
    const b = blogs.reduce( (acc,crr) => {
      if( acc.author === crr.author) {
        return { author:acc.author,blogs:++sum }
      }else{
        return acc
      }
    },blog)
    return b
  })

  const mayor = (fav, crr) => {
    return ( fav.blogs >= crr.blogs) ? fav : crr
  }
  return groupBlog.lenth === 0 ? {} : groupBlog.reduce(mayor,{})


}

const mostLikes = (blogs) => {
  const favorite = favoriteBlog(blogs)

  let sum = 0

  blogs.filter( b => {
    if (b.author === favorite.author) {
      sum += b.likes
      return b.likes
    }
  }, sum )


  return { author:favorite.author,likes:sum }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}