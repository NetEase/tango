import React, { useEffect, useState } from 'react';
import { Button, Empty, Modal, Pagination, Radio } from 'antd';
import { Box, css, Grid, GridItem, Text } from 'coral-system';
import { isFunction, useBoolean } from '@music163/tango-helpers';
import { FormItemComponentProps } from '../form-item';
import { useFormVariable } from '../context';

const wrapperStyle = css`
  img {
    max-width: 100%;
    max-height: 150px;
  }
`;

export function ImageSetter({ value, onChange }: FormItemComponentProps) {
  const [visible, { on, off }] = useBoolean();
  const label = value ? '更新图片' : '上传图片';
  const { remoteServices } = useFormVariable();
  return (
    <Box css={wrapperStyle}>
      <Box border="solid" borderColor="line.normal" textAlign="center" mb="m">
        {value ? <img src={value} alt="preview image" /> : null}
      </Box>
      <Button block onClick={on}>
        {label}
      </Button>
      <Modal title={label} visible={visible} onCancel={off} width="60%">
        <ImageCenter
          imageService={remoteServices?.ImageService}
          onSelect={(url) => {
            onChange(url);
            off();
          }}
        />
      </Modal>
    </Box>
  );
}

const categories = [
  { label: '我的素材', value: 'listMy' },
  { label: '我的收藏', value: 'listFav' },
  { label: '公共素材', value: 'listPub' },
];

interface ImageCenterProps {
  onSelect?: ImageListProps['onSelect'];
  imageService?: Record<string, (...args: any[]) => Promise<any>>;
}

const pageSize = 20;

function ImageCenter({ imageService, onSelect }: ImageCenterProps) {
  const [cate, setCate] = useState('listMy');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>({});
  useEffect(() => {
    imageService?.[cate]?.({ limit: pageSize, offset: (page - 1) * pageSize }).then((res: any) => {
      setData(res || {});
    });
  }, [imageService, cate, page]);
  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Radio.Group
          value={cate}
          onChange={(e) => {
            setCate(e.target.value);
          }}
          options={categories}
          optionType="button"
          buttonStyle="solid"
        />
        <Button
          type="primary"
          href="https://music-fn.hz.netease.com/s/music-deer-web/user/image/myupload"
          target="_blank"
        >
          我要上传
        </Button>
      </Box>
      {data.list?.length ? (
        <ImageList dataSource={data.list} onSelect={onSelect} />
      ) : (
        <Empty description="没有数据或数据服务请求出错" />
      )}
      {data.count > pageSize ? (
        <Pagination current={page} total={data.count} pageSize={pageSize} onChange={setPage} />
      ) : null}
    </Box>
  );
}

const imageListWrapper = css`
  img {
    max-width: 100%;
    max-height: 120px;
  }

  button {
    border-color: transparent;
    outline: none;
    padding: 0;
    margin: 0;

    &:hover {
      border-color: var(--tango-colors-brand);
    }
  }
`;

interface ImageListProps {
  dataSource?: any[];
  onSelect?: (url: string) => void;
}

function ImageList({ dataSource = [], onSelect }: ImageListProps) {
  return (
    <Grid my="m" columns={4} gap="12px" height="400px" overflow="auto" css={imageListWrapper}>
      {dataSource.map((item) => (
        <GridItem
          key={item.id}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.20"
        >
          <Box
            as="button"
            display="inline-flex"
            flexDirection="column"
            alignItems="center"
            gap="m"
            bg="transparent"
            onClick={() => {
              isFunction(onSelect) && onSelect(item.url);
            }}
          >
            <img src={item.url} />
            <Text fontSize="12px" color="text.note">
              {item.name}
            </Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
}
