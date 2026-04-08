<script setup lang="ts">
defineProps<{
  title: string
  item: { id: number; nome: string } | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirm: [id: number]
}>()
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir
          <strong>{{ item?.nome }}</strong
          >? Esta acao nao pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          class="bg-danger-600 text-base-0 hover:bg-danger-700"
          @click="item && emit('confirm', item.id)"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
