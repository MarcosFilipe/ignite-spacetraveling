/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {

  const router = useRouter();

  const formatDate = (date: string): string => {
    if (!date) return '';
    return format(
      new Date(date),
      'dd MMM y',
      { locale: ptBR }
    )
  }

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt={post.data.title} />
      <div className={commonStyles.container} >
        <div className={styles.title}>{post.data.title}</div>
        <div className={`${styles.info} ${styles.flex}`}>
          <div className={styles.flex}>
            <FiCalendar />
            <time>{formatDate(post?.first_publication_date)}</time>
          </div>
          <div className={styles.flex}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.flex}>
            <FiClock />
            <span>4 min</span>
          </div>
        </div>
        <article className={styles.content}>
          {
            post.data.content.map((content, i) => (
              <div key={i}>
                <h2 className={styles.heading}>{content.heading}</h2>
                <div className={styles.body} dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
              </div>
            ))
          }
        </article>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', { pageSize: 2 });
  const paths = posts.results?.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response
    },
    revalidate: 60 * 60 // 1h
  }
};
