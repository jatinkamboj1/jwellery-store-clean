"use client"
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import style from "./breadcumb.module.scss";
import Link from 'next/link';

const getPathFromUrl = (url) => {
  return url.split(/[?#]/)[0];
};

const convertBreadcrumb = (
  title,
  toUpperCase,
  replaceCharacterList,
  transformLabel
) => {
  let transformedTitle = getPathFromUrl(title);

  if (transformLabel) {
    return transformLabel(transformedTitle);
  }

  if (replaceCharacterList) {
    for (let i = 0; i < replaceCharacterList.length; i++) {
      transformedTitle = transformedTitle.replaceAll(
        replaceCharacterList[i].from,
        replaceCharacterList[i].to
      );
    }
  }
  return toUpperCase ? decodeURI(transformedTitle).toUpperCase() : decodeURI(transformedTitle);
};

const Breadcrumbs = ({
  rootLabel= 'Home',
  omitRootLabel= false,
  labelsToUppercase= false,
  replaceCharacterList= [{ from: '-', to: ' ' }],
  transformLabel= undefined,
  omitIndexList= undefined,
  visible= 0
}) => {
  const router = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const excludeList = ['category', 'product'];

  useEffect(() => {
    if (router) {
        // //console.log('router', router);
      const linkPath = router.split('/');
      linkPath.shift();

      const pathArray = linkPath.map((path, i) => {
        return {
          breadcrumb: path,
          href: '/' + linkPath.slice(0, i + 1).join('/'),
        };
      });

      setBreadcrumbs(pathArray);
    }
  }, [router]);

  if (!breadcrumbs || breadcrumbs.length >= 1) {
    return null;
  }
  return (
    <div className={`${style.breadcrumb} ${visible?'': 'hide'}`} aria-label="breadcrumbs">
      <div className="container">
          <div className="row">
              <div className="col-12">
                  <div className="breadcrumb-wrap">
                      <nav aria-label="breadcrumb">
                          <ul className="breadcrumb">
                              <li className="breadcrumb-item"><Link href="/"><i className="fa fa-home"></i></Link></li>
                              {breadcrumbs.length >= 1 && breadcrumbs.map((breadcrumb, i) => {
                                if ( !breadcrumb || breadcrumb.breadcrumb.length === 0 || (omitIndexList && omitIndexList.find((value) => value === i) || excludeList.includes(breadcrumb.breadcrumb.toLowerCase()))
                                ) {
                                  return;
                                }
                                return (
                                  <li className={`breadcrumb-item ${breadcrumbs.length-1 === i ? 'active': ''}`} aria-current="page" key={breadcrumb.href}>
                                      <Link href={breadcrumb.href}>
                                        {convertBreadcrumb( breadcrumb.breadcrumb, labelsToUppercase, replaceCharacterList, transformLabel )}
                                      </Link>
                                  </li>
                                );
                              })}
                          </ul>
                      </nav>
                  </div>
              </div>
          </div>
      </div>
  </div>
  );
};

export default Breadcrumbs;