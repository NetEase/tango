import React from 'react';
// import data from './tango-types.json';
const data: any = {};

const typeMap = {};
if (data && data.children) {
  data.children.forEach((group) => {
    group.children.forEach((item) => {
      if (item.name) {
        typeMap[item.name] = item;
      }
    });
  });
}

const getType = (type: any = {}) => {
  let ret;
  switch (type.type) {
    case 'union':
      ret = 'union';
      break;
    case 'array':
      ret = `${getType(type.elementType)}[]`;
      break;
    default:
      ret = type.name;
      break;
  }
  return ret;
};

// function normalizeText(text) {
//   return text?.replaceAll('\n', '<br />');
// }

export function Line({ html }: any) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const typeTableColumns = [
  { dataIndex: 'name', title: '属性名' },
  {
    dataIndex: 'type',
    title: '类型',
    render(val, record) {
      if (record.kindString === 'Method') {
        return 'function';
      }
      return getType(record.type || {});
    },
  },
  {
    dataIndex: 'flags.isOptional',
    title: '是否必选',
    render(val, record) {
      return record.flags.isOptional ? null : '必填';
    },
  },
  {
    dataIndex: 'comment',
    title: '说明',
    width: '40%',
    render(val) {
      if (!val) {
        return null;
      }

      return (
        <div>
          <Line
            html={
              val.summary
                ? val.summary
                    .map((item) => {
                      if (item.kind === 'text') {
                        return item.text.replaceAll('\n', '<br />');
                      }
                      return '';
                    })
                    .join('<br />')
                : undefined
            }
          />
          {/* <Line
            html={
              val.blockTags
                ? val.blockTags
                    .map((item) =>
                      item.content?.map((tag) => tag?.text).join('<br />')
                    )
                    .join('<br />')
                : null
            }
          /> */}
        </div>
      );
    },
  },
];

export default function TypeTable(props: any) {
  const { name } = props;
  const detail = typeMap[name];

  if (!detail) {
    return <div style={{ border: '1px solid red', color: 'red' }}>can not find {name}</div>;
  }

  let dataSource = [];
  if (detail.type?.type === 'reflection') {
    dataSource = detail.type.declaration.children;
  } else {
    dataSource = detail.children;
  }

  return (
    <SimpleTable title={name} dataSource={dataSource} columns={typeTableColumns} rowKey="id" />
  );
}

function SimpleTable({ title, dataSource, columns, rowKey }: any) {
  return (
    <table className="SimpleTable" style={{ width: '100%' }}>
      {title && <caption>{title}</caption>}
      {renderTableHead(columns)}
      {renderTableBody(dataSource, columns, rowKey)}
    </table>
  );
}

function renderTableHead(columns: any[] = []) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.dataIndex} style={{ width: column.width }}>
            {column.title}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function renderTableBody(dataSource, columns, rowKey) {
  return (
    <tbody>
      {dataSource.map((rowData) => {
        if (!rowData) {
          return null;
        }
        return (
          <tr key={rowData[rowKey]}>
            {columns.map((column, rowIndex) => (
              <td key={column.dataIndex}>{renderTableCell(column, rowData, rowIndex)}</td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}

function renderTableCell({ dataIndex, render }, rowData, rowIndex) {
  const val = getValueByPath(rowData, dataIndex);
  if (typeof render === 'function') {
    return render(val, rowData, rowIndex);
  }
  return val;
}

function getValueByPath(obj, path) {
  if (!path) {
    return;
  }

  const paths = path.split('.');
  return paths.reduce((prev, cur) => {
    return prev[cur];
  }, obj);
}
