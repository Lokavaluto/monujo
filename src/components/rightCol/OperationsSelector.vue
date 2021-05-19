<template>
    <h2 class="custom-card-title">Operations</h2>
            <div
              class="x-scroll-disabled tabs is-toggle is-toggle-rounded custom-tabs-switch-div"
            >
              <ul class="is-justify-content-space-between">
                <li class="custom-is-active custom-tabs-switch">
                  <a>Passées </a>
                </li>
                <li class="custom-tabs-switch"><a>En cours</a></li>
                <li class="custom-tabs-switch"><a>A venir</a></li>
              </ul>
            </div>
</template>

<script>
export default {
    name:"OperationsSelector"
}
</script>