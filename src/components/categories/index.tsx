
import { FC, useState } from 'react'

import { View, Text } from '@tarojs/components'


import bookIcon from '@/assets/book-bold-duotone.svg'
import buildingsIcon from '@/assets/buildings-2-bold-duotone.svg'
import magniferIcon from '@/assets/magnifer-bold-duotone.svg'
import rocketIcon from '@/assets/rocket-bold-duotone.svg'
import usersGroupIcon from '@/assets/users-group-rounded-bold-duotone.svg'

import styles from './index.module.scss'

const categoriesData = [
  { id: 1, name: '学习交流', icon: bookIcon },
  { id: 2, name: '校园生活', icon: buildingsIcon },
  { id: 3, name: '就业创业', icon: rocketIcon },
  { id: 4, name: '社团活动', icon: usersGroupIcon },
  { id: 5, name: '失物招领', icon: magniferIcon },
]

interface CategoriesProps {
  onCategorySelect: (_id: number | null) => void
}

const Categories: FC<CategoriesProps> = ({ onCategorySelect }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleCategoryClick = (id: number) => {
    const newSelectedId = selectedId === id ? null : id
    setSelectedId(newSelectedId)
    onCategorySelect(newSelectedId)
  }

  return (
    <View className={styles.categoriesContainer}>
      {categoriesData.map((category) => (
        <View
          key={category.id}
          className={`${styles.categoryItem} ${selectedId === category.id ? styles.selected : ''}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <View className={styles.categoryIconContainer}>
            <View
              className={styles.categoryIcon}
              style={{ '--icon-url': `url(${category.icon})` } as React.CSSProperties}
            />
          </View>
          <Text className={styles.categoryName}>{category.name}</Text>
        </View>
      ))}
    </View>
  )
}

export default Categories
