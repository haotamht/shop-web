import _ from 'lodash';
import { useSelector } from 'react-redux';

import Product from '~/components/Product';
import NavbarAllPro from '~/components/NavbarAllPro';
import { pathApi } from '~/asset/path';
import { useEffect, useState } from 'react';

function AllSalePage() {
    const [data, setData] = useState();
    const { dataProAll } = useSelector((state) => state.productsAll);
    useEffect(() => {
        const productsWithDiscount = _.filter(dataProAll.products, (product) => product.discountPercentage !== 0);
        setData(productsWithDiscount);
        console.log(productsWithDiscount);
    }, [dataProAll.products]);

    return (
        <div className="lg:px-[50px] lg:mx-[-15px]">
            <NavbarAllPro />
            {data?.length !== 0 ? (
                <div className="grid grid-cols-2 gap-y-[50px] lg:grid-cols-4 lg:gap-y-[50px]">
                    {data?.map((product) => {
                        return <Product product={product} path={pathApi} />;
                    })}
                </div>
            ) : (
                <div className="my-[200px] flex items-center justify-center w-full">
                    <div className="text-[20px]">Chưa có sản phẩm nào.</div>
                </div>
            )}
        </div>
    );
}

export default AllSalePage;
