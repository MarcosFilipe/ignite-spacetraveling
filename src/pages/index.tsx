import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {

  const [nextPageUrl, setNextPageUrl] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState(postsPagination.results)

  const formatDate = (date: string): string => {
    if (!date) return '';

    return format(
      new Date(date),
      'dd MMM y',
      { locale: ptBR }
    )
  }

  const nextPage = async (): Promise<void> => {
    const response = await fetch(nextPageUrl)
    const newPage: PostPagination = await response.json();

    setNextPageUrl(newPage.next_page)
    setPosts([...posts, ...newPage.results])
  }

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        {posts?.map((post) => (
          <Link key={post.uid} href={`/post/${post?.uid}`}>
            <div className={styles.post}>
              <div className={styles.title}>{post.data?.title}</div>
              <div className={styles.subtitle}>{post.data.subtitle}</div>
              <div className={`${styles.info} ${styles.flex}`}>
                <div className={styles.flex}>
                  <FiCalendar />
                  <time>{formatDate(post?.first_publication_date)}</time>
                </div>
                <div className={styles.flex}>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {nextPageUrl &&
          <a onClick={nextPage} className={styles.morePostsBtn}>Carregar mais posts</a>
        }
      </div>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 2 });

  const posts: Post[] = postsResponse.results as unknown as Post[];

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination
    }
  }
};
